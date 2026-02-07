// src/app/api/reports/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getCached, invalidateCache } from "@/lib/redis";
import {
  requireAuth,
  applyRateLimit,
  withRetry,
  handleApiError,
} from "@/lib/api-utils";

// GET: Fetch single report details WITH CACHING
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Get report ID (no auth required for viewing public reports)
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid report ID format" },
        { status: 400 }
      );
    }

    // 2. Optional auth for rate limiting
    const { userId } = await auth();
    
    // 3. Apply rate limiting (even for unauthenticated users, use IP)
    const identifier = userId || request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await applyRateLimit(identifier, 'read');
    if (rateLimitResult.error) return rateLimitResult.error;

    // 4. Use caching (10 minute TTL for individual reports)
    const cacheKey = `report:${id}`;
    
    const reportData = await getCached(
      cacheKey,
      async () => {
        const client = await clientPromise;
        const db = client.db("tracevault");

        // Fetch report with retry
        const report = await withRetry(async () => {
          return await db.collection("reports").findOne({
            _id: new ObjectId(id),
          });
        });

        if (!report) {
          return null;
        }

        // Fetch claim count
        const claimCount = await withRetry(async () => {
          return await db.collection("claims").countDocuments({
            reportId: new ObjectId(id),
          });
        });

        // Fetch recent claims (for reporter view)
        const recentClaims = await withRetry(async () => {
          return await db
            .collection("claims")
            .find({ reportId: new ObjectId(id) })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();
        });

        return {
          _id: report._id.toString(),
          reporterId: report.reporterId,
          description: report.description,
          category: report.category,
          imageUrl: report.imageUrl || null,
          status: report.status || "open",
          claimed_at: report.claimed_at?.toISOString() || null,
          user: report.user,
          createdAt: report.createdAt.toISOString(),
          updatedAt: report.updatedAt?.toISOString() || null,
          claimCount,
          recentClaims: recentClaims.map(c => ({
            _id: c._id.toString(),
            status: c.status,
            createdAt: c.createdAt.toISOString(),
          })),
        };
      },
      600 // Cache for 10 minutes
    );

    if (!reportData) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // 5. Return report data
    return NextResponse.json(reportData, {
      headers: rateLimitResult.headers as Record<string, string>,
    });

  } catch (error) {
    return handleApiError(error, "Failed to fetch report");
  }
}

// PATCH: Update report (mark as claimed, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Require authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    // 2. Apply rate limiting
    const rateLimitResult = await applyRateLimit(userId, 'general');
    if (rateLimitResult.error) return rateLimitResult.error;

    // 3. Get report ID
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid report ID format" },
        { status: 400 }
      );
    }

    // 4. Parse body
    const body = await request.json();
    const { status, description, category } = body;

    // 5. Validate allowed updates
    const allowedStatuses = ["open", "claimed", "closed"];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${allowedStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    // 6. Verify ownership
    const report = await withRetry(async () => {
      return await db.collection("reports").findOne({
        _id: new ObjectId(id),
      });
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    if (report.reporterId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own reports" },
        { status: 403 }
      );
    }

    // 7. Build update object
    const updateFields: any = { updatedAt: new Date() };
    
    if (status) {
      updateFields.status = status;
      if (status === "claimed") {
        updateFields.claimed_at = new Date();
      }
    }
    
    if (description) updateFields.description = description.trim();
    if (category) updateFields.category = category;

    // 8. Update report
    await withRetry(async () => {
      return await db.collection("reports").updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      );
    });

    // 9. Invalidate caches
    await Promise.all([
      invalidateCache(`report:${id}`), // Single report cache
      invalidateCache(`user-reports:${userId}`), // User's reports
      invalidateCache(`reports:*`), // All report feeds
    ]);

    // 10. Return success
    return NextResponse.json(
      {
        success: true,
        message: "Report updated successfully",
        updatedFields: Object.keys(updateFields),
      },
      {
        headers: rateLimitResult.headers as Record<string, string>,
      }
    );

  } catch (error) {
    return handleApiError(error, "Failed to update report");
  }
}

// DELETE: Delete report (owner only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Require authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    // 2. Apply rate limiting
    const rateLimitResult = await applyRateLimit(userId, 'general');
    if (rateLimitResult.error) return rateLimitResult.error;

    // 3. Get report ID
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid report ID format" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    // 4. Verify ownership before deletion
    const report = await withRetry(async () => {
      return await db.collection("reports").findOne({
        _id: new ObjectId(id),
      });
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    if (report.reporterId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own reports" },
        { status: 403 }
      );
    }

    // 5. Check if report has approved claims
    const hasApprovedClaims = await withRetry(async () => {
      const count = await db.collection("claims").countDocuments({
        reportId: new ObjectId(id),
        status: "approved",
      });
      return count > 0;
    });

    if (hasApprovedClaims) {
      return NextResponse.json(
        {
          error: "Cannot delete report with approved claims. Please mark as closed instead.",
        },
        { status: 409 } // Conflict
      );
    }

    // 6. Delete report and associated claims
    await withRetry(async () => {
      // Delete all claims for this report
      await db.collection("claims").deleteMany({
        reportId: new ObjectId(id),
      });

      // Delete the report
      await db.collection("reports").deleteOne({
        _id: new ObjectId(id),
      });
    });

    // 7. Invalidate caches
    await Promise.all([
      invalidateCache(`report:${id}`),
      invalidateCache(`user-reports:${userId}`),
      invalidateCache(`reports:*`),
    ]);

    // 8. Return success
    return NextResponse.json(
      {
        success: true,
        message: "Report and associated claims deleted successfully",
      },
      {
        headers: rateLimitResult.headers as Record<string, string>,
      }
    );

  } catch (error) {
    return handleApiError(error, "Failed to delete report");
  }
}
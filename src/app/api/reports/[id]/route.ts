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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid report ID format" },
        { status: 400 },
      );
    }

    const { userId } = await auth();

    const identifier =
      userId || request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimitResult = await applyRateLimit(identifier, "read");
    if (rateLimitResult.error) return rateLimitResult.error;

    const cacheKey = `report:${id}`;

    const reportData = await getCached(
      cacheKey,
      async () => {
        const client = await clientPromise;
        const db = client.db("tracevault");

        const report = await withRetry(async () => {
          return await db.collection("reports").findOne({
            _id: new ObjectId(id),
          });
        });

        if (!report) {
          return null;
        }

        const claimCount = await withRetry(async () => {
          return await db.collection("claims").countDocuments({
            reportId: new ObjectId(id),
          });
        });

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
          recentClaims: recentClaims.map((c) => ({
            _id: c._id.toString(),
            status: c.status,
            createdAt: c.createdAt.toISOString(),
          })),
        };
      },
      600,
    );

    if (!reportData) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(reportData, {
      headers: rateLimitResult.headers as Record<string, string>,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch report");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const rateLimitResult = await applyRateLimit(userId, "general");
    if (rateLimitResult.error) return rateLimitResult.error;

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid report ID format" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { status, description, category } = body;

    const allowedStatuses = ["open", "claimed", "closed"];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${allowedStatuses.join(", ")}` },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    const report = await withRetry(async () => {
      return await db.collection("reports").findOne({
        _id: new ObjectId(id),
      });
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.reporterId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own reports" },
        { status: 403 },
      );
    }

    const updateFields: any = { updatedAt: new Date() };

    if (status) {
      updateFields.status = status;
      if (status === "claimed") {
        updateFields.claimed_at = new Date();
      }
    }

    if (description) updateFields.description = description.trim();
    if (category) updateFields.category = category;

    await withRetry(async () => {
      return await db
        .collection("reports")
        .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
    });

    await Promise.all([
      invalidateCache(`report:${id}`),
      invalidateCache(`user-reports:${userId}`),
      invalidateCache(`reports:*`),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Report updated successfully",
        updatedFields: Object.keys(updateFields),
      },
      {
        headers: rateLimitResult.headers as Record<string, string>,
      },
    );
  } catch (error) {
    return handleApiError(error, "Failed to update report");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const rateLimitResult = await applyRateLimit(userId, "general");
    if (rateLimitResult.error) return rateLimitResult.error;

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid report ID format" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    const report = await withRetry(async () => {
      return await db.collection("reports").findOne({
        _id: new ObjectId(id),
      });
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.reporterId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own reports" },
        { status: 403 },
      );
    }

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
          error:
            "Cannot delete report with approved claims. Please mark as closed instead.",
        },
        { status: 409 }, // Conflict
      );
    }

    await withRetry(async () => {
      await db.collection("claims").deleteMany({
        reportId: new ObjectId(id),
      });

      await db.collection("reports").deleteOne({
        _id: new ObjectId(id),
      });
    });

    await Promise.all([
      invalidateCache(`report:${id}`),
      invalidateCache(`user-reports:${userId}`),
      invalidateCache(`reports:*`),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Report and associated claims deleted successfully",
      },
      {
        headers: rateLimitResult.headers as Record<string, string>,
      },
    );
  } catch (error) {
    return handleApiError(error, "Failed to delete report");
  }
}

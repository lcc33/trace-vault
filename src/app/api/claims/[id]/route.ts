import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { invalidateCache } from "@/lib/redis";
import {
  requireAuth,
  applyRateLimit,
  withRetry,
  handleApiError,
} from "@/lib/api-utils";

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
        { error: "Invalid claim ID format" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { action } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    const claim = await withRetry(async () => {
      return await db.collection("claims").findOne({
        _id: new ObjectId(id),
      });
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.status !== "pending") {
      return NextResponse.json(
        {
          error: `This claim has already been ${claim.status}`,
          currentStatus: claim.status,
        },
        { status: 409 }, // Conflict
      );
    }

    const report = await withRetry(async () => {
      return await db.collection("reports").findOne({
        _id: claim.reportId,
      });
    });

    if (!report) {
      return NextResponse.json(
        { error: "Associated report not found" },
        { status: 404 },
      );
    }

    if (report.reporterId !== userId) {
      return NextResponse.json(
        {
          error: "Forbidden: You can only manage claims on your own reports",
        },
        { status: 403 },
      );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";
    const now = new Date();

    try {
      await withRetry(async () => {
        await db.collection("claims").updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: newStatus,
              processedAt: now,
              processedBy: userId,
              updatedAt: now,
            },
          },
        );

        if (action === "approve") {
          await db.collection("reports").updateOne(
            { _id: claim.reportId },
            {
              $set: {
                status: "claimed",
                claimed_at: now,
                updatedAt: now,
              },
            },
          );

          await db.collection("claims").updateMany(
            {
              reportId: claim.reportId,
              _id: { $ne: new ObjectId(id) },
              status: "pending",
            },
            {
              $set: {
                status: "rejected",
                rejectionReason: "Another claim was approved",
                processedAt: now,
                updatedAt: now,
              },
            },
          );
        }
      });
    } catch (updateError) {
      console.error("Failed to update claim/report:", updateError);
      throw new Error("Failed to process claim. Please try again.");
    }

    await Promise.all([
      invalidateCache(`user-claims:${userId}`),
      invalidateCache(`user-claims:${claim.claimantId}`),
      invalidateCache(`user-reports:${userId}`),
      invalidateCache(`reports:*`),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: `Claim ${newStatus} successfully`,
        status: newStatus,
        claimId: id,
        ...(action === "approve" && {
          reportStatus: "claimed",
          note: "Report has been marked as claimed",
        }),
      },
      {
        status: 200,
        headers: rateLimitResult.headers as Record<string, string>,
      },
    );
  } catch (error: any) {
    console.error("PATCH /api/claims/[id] error:", error);
    return handleApiError(error, "Failed to process claim");
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const rateLimitResult = await applyRateLimit(userId, "read");
    if (rateLimitResult.error) return rateLimitResult.error;

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid claim ID format" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    const claim = await withRetry(async () => {
      const claims = await db
        .collection("claims")
        .aggregate([
          { $match: { _id: new ObjectId(id) } },
          {
            $lookup: {
              from: "reports",
              localField: "reportId",
              foreignField: "_id",
              as: "report",
            },
          },
          { $unwind: "$report" },
          {
            $lookup: {
              from: "users",
              localField: "claimantId",
              foreignField: "clerkId",
              as: "claimant",
            },
          },
          {
            $unwind: {
              path: "$claimant",
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .toArray();

      return claims[0] || null;
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const isReporter = claim.report.reporterId === userId;
    const isClaimant = claim.claimantId === userId;

    if (!isReporter && !isClaimant) {
      return NextResponse.json(
        { error: "Forbidden: You don't have access to this claim" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        _id: claim._id.toString(),
        reportId: claim.reportId.toString(),
        reportTitle: claim.report?.description || "Deleted report",
        claimantId: claim.claimantId,
        claimantName: claim.claimant?.name || "Unknown",
        description: claim.description,
        proofImage: claim.proofImage,
        status: claim.status,
        createdAt: claim.createdAt.toISOString(),
        processedAt: claim.processedAt?.toISOString() || null,
        updatedAt: claim.updatedAt?.toISOString() || null,
      },
      {
        headers: rateLimitResult.headers as Record<string, string>,
      },
    );
  } catch (error) {
    return handleApiError(error, "Failed to fetch claim");
  }
}

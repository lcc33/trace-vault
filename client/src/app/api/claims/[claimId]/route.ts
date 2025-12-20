// src/app/api/claims/[claimId]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PATCH: Approve or Reject a Claim
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ claimId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = await params; // ← UNWRAP THE PROMISE

    if (!ObjectId.isValid(claimId)) {
      return NextResponse.json({ error: "Invalid claim ID" }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    const claim = await db
      .collection("claims")
      .findOne({ _id: new ObjectId(claimId) });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const report = await db
      .collection("reports")
      .findOne({ _id: claim.reportId });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.reporterId !== userId) {
      return NextResponse.json(
        { error: "You can only manage claims on your own reports" },
        { status: 403 },
      );
    }

    // Approve → mark report as claimed
    if (action === "approve") {
      await db
        .collection("reports")
        .updateOne(
          { _id: claim.reportId },
          { $set: { status: "claimed", updatedAt: new Date() } },
        );
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    const result = await db
      .collection("claims")
      .updateOne(
        { _id: new ObjectId(claimId) },
        { $set: { status: newStatus, updatedAt: new Date() } },
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update claim" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: `Claim ${newStatus} successfully`,
      status: newStatus,
    });
  } catch (error: any) {
    console.error("PATCH /api/claims/[claimId] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

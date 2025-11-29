// src/app/api/claims/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface RouteParams {
  params: {
    id: string;
  };
}

// PATCH: Approve or Reject a Claim
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid claim ID" }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    // Fetch claim
    const claim = await db
      .collection("claims")
      .findOne({ _id: new ObjectId(id) });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Fetch associated report
    const report = await db
      .collection("reports")
      .findOne({ _id: claim.reportId });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Ownership check: only reporter can approve/reject
    if (report.reporterId !== userId) {
      return NextResponse.json(
        { error: "You can only manage claims on your own reports" },
        { status: 403 }
      );
    }

    // If approving → mark report as claimed
    if (action === "approve") {
      await db
        .collection("reports")
        .updateOne(
          { _id: claim.reportId },
          { $set: { status: "claimed", updatedAt: new Date() } }
        );
    }

    // Update claim status
    const newStatus = action === "approve" ? "approved" : "rejected";

    const result = await db
      .collection("claims")
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: newStatus,
            updatedAt: new Date(),
          },
        }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update claim" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Claim ${action === "approve" ? "approved" : "rejected"} successfully`,
      status: newStatus,
    });
  } catch (error: any) {
    console.error("PATCH /api/claims/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
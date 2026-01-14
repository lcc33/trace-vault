// src/app/claims/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// PATCH: Approve or Reject a Claim (Reporter only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid claim ID" }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    const claim = await db.collection("claims").findOne({
      _id: new ObjectId(id),
      
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const report = await db.collection("reports").findOne({
      _id: claim.reportId,
      // In the PATCH endpoint when status changes to "claimed"

    });

    if (!report || report.reporterId !== userId) {
      return NextResponse.json({ error: "Forbidden: You can only manage claims on your reports" }, { status: 403 });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    // If approving, optionally mark report as claimed (or leave for separate action)
    if (action === "approve") {
      await db.collection("reports").updateOne(
        { _id: claim.reportId },
        { $set: { status: "claimed", updatedAt: new Date() } }
      );
      
    }

    await db.collection("claims").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: newStatus,
          claimedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: `Claim ${newStatus} successfully`,
      status: newStatus,
    });
  } catch (error) {
    console.error("PATCH /api/claims/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
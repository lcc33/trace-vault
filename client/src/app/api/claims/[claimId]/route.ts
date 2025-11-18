import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { action } = await request.json(); // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" }, 
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid claim ID format" }, 
        { status: 400 }
      );
    }


    const client = await clientPromise;
    const db = client.db("tracevault");

    // Get the claim
    const claim = await db.collection("claims").findOne({ _id: new ObjectId(id) });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Verify user owns the report associated with this claim
    // claim.reportId in DB may be an ObjectId or a string; handle both
    let reportLookupId: any = (claim as any).reportId;
    if (typeof reportLookupId === "string") {
      try {
        reportLookupId = new ObjectId(reportLookupId);
      } catch {}
    }

    const report = await db.collection("reports").findOne({ _id: reportLookupId });

    // Ownership: reports store the Clerk user id in `reporterId`
    if (!report || report.reporterId !== userId) {
      return NextResponse.json(
        { error: "You can only update claims on your own reports" }, 
        { status: 403 }
      );
    }

    // Update claim status
    const newStatus = action === "approve" ? "approved" : "rejected";
    
    const updateResult = await db.collection("claims").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: newStatus,
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update claim" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: `Claim ${action}d successfully`,
      status: newStatus
    });

  } catch (error: any) {
    console.error("Error updating claim:", error);
    return NextResponse.json(
      { error: "Failed to update claim" }, 
      { status: 500 }
    );
  }
}
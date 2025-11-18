// src/app/api/reports/route.ts   (or src/app/api/reports/[id]/route.ts if you prefer)
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";

export async function DELETE(request: Request) {
  try {
    // 1. Authenticate with Clerk
    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json(
        { error: "Unauthorized – please sign in" },
        { status: 401 }
      );
    }

    // 2. Extract report ID from query string (or body)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing report ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    // 3. Find the report
    const report = await db.collection("reports").findOne({ _id: new ObjectId(id) });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // 4. Authorization – only the owner can delete
    // (Assuming you store the reporter's TraceVault user _id as reporterId)
    const traceVaultUser = await db
      .collection("users")
      .findOne({ clerkId: clerkUser.id });

    if (!traceVaultUser) {
      return NextResponse.json(
        { error: "User record not found" },
        { status: 404 }
      );
    }

    if (report.reporterId !== traceVaultUser._id) {
      return NextResponse.json(
        { error: "Forbidden – you can only delete your own reports" },
        { status: 403 }
      );
    }

    // 5. Delete the report + related claims (optional but recommended)
    await db.collection("reports").deleteOne({ _id: new ObjectId(id) });
    await db.collection("claims").deleteMany({ reportId: new ObjectId(id) });

    return NextResponse.json({ message: "Report deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/reports error:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
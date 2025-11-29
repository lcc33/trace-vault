// src/app/api/reports/delete/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized – please sign in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Valid report ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    // Find the report
    const report = await db.collection("reports").findOne({
      _id: new ObjectId(id),
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Authorization: Only the owner (reporterId === Clerk userId) can delete
    if (report.reporterId !== userId) {
      return NextResponse.json(
        { error: "Forbidden – you can only delete your own reports" },
        { status: 403 }
      );
    }

    // Delete report + all associated claims
    await db.collection("reports").deleteOne({ _id: new ObjectId(id) });
    await db.collection("claims").deleteMany({ reportId: new ObjectId(id) });

    return NextResponse.json({
      message: "Report and all claims deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/reports/delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
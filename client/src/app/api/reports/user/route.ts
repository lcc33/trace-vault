// src/app/api/reports/user/route.ts
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    // Get the authenticated Clerk user
    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    // Find the TraceVault user record (created on sign‑up)
    const user = await db.collection("users").findOne({ clerkId: clerkUser.id });
    if (!user?._id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch **all** reports belonging to this user
    const reports = await db
      .collection("reports")
      .find({ reporterId: user._id }) // string ID
      .sort({ createdAt: -1 })
      .toArray();

    // Attach claim count to each report
    const reportsWithClaims = await Promise.all(
      reports.map(async (report) => {
        const claimCount = await db
          .collection("claims")
          .countDocuments({ reportId: report._id });

        return {
          _id: report._id, // already string
          reporterId: report.reporterId,
          title: report.title,
          description: report.description,
          category: report.category,
          location: report.location,
          imageUrl: report.imageUrl,
          status: report.status,
          createdAt: new Date(report.createdAt).toISOString(),
          claimCount,
        };
      })
    );

    return NextResponse.json(reportsWithClaims);
  } catch (error: any) {
    console.error("Error fetching user reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
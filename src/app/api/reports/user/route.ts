// src/app/api/reports/user/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const { userId } = await auth(); // This is the Clerk user ID (string)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    // Find reports where reporterId === Clerk userId (string)
    const reports = await db
      .collection("reports")
      .find({ reporterId: userId }) // ← FIXED: reporterId, not userId
      .sort({ createdAt: -1 })
      .toArray();

    // Add claim count to each report
    const reportsWithClaims = await Promise.all(
      reports.map(async (report) => {
        const claimCount = await db
          .collection("claims")
          .countDocuments({ reportId: report._id });

        return {
          _id: report._id.toString(),
          description: report.description,
          category: report.category,
          imageUrl: report.imageUrl || null,
          status: report.status || "open",
          createdAt: report.createdAt.toISOString(),
          updatedAt: report.updatedAt?.toISOString() || null,
          claimCount,
        };
      }),
    );

    return NextResponse.json(reportsWithClaims);
  } catch (error: any) {
    console.error("GET /api/reports/user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch your reports" },
      { status: 500 },
    );
  }
}

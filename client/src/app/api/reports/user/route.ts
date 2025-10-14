import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    // Get current user
    const user = await db.collection("users").findOne({ 
      email: session.user.email 
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's reports
    const reports = await db.collection("reports")
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .toArray();

    // Get claim counts for each report
    const reportsWithClaimCounts = await Promise.all(
      reports.map(async (report) => {
        const claimCount = await db.collection("claims").countDocuments({
          reportId: report._id
        });

        return {
          ...report,
          _id: report._id.toString(),
          userId: report.userId.toString(),
          claimCount,
          createdAt: report.createdAt.toISOString()
        };
      })
    );

    return NextResponse.json(reportsWithClaimCounts);

  } catch (error: any) {
    console.error("Error fetching user reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch user reports" }, 
      { status: 500 }
    );
  }
}
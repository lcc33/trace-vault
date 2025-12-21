// src/app/api/claims/route.ts
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const DAILY_CLAIM_LIMIT = 5;

// --- GET: Fetch user's claims (made + received) ---
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("tracevault");

    // Get or create DB user
    let dbUser = await db.collection("users").findOne({ clerkId: userId });
    if (!dbUser) {
      const clerkProfile = await currentUser();
      if (!clerkProfile)
        return NextResponse.json({ error: "User not found" }, { status: 404 });

      const newUser = {
        clerkId: userId,
        name:
          `${clerkProfile.firstName || ""} ${clerkProfile.lastName || ""}`.trim() ||
          clerkProfile.username ||
          "Anonymous",
        email: clerkProfile.primaryEmailAddress?.emailAddress || null,
        profilePic: clerkProfile.imageUrl || null,
        createdAt: new Date(),
      };

      const res = await db.collection("users").insertOne(newUser);
      dbUser = { ...newUser, _id: res.insertedId };
    }

    // === CLAIMS MADE BY USER (Claimant view) ===
    const claimsMade = await db
      .collection("claims")
      .aggregate([
        { $match: { claimantId: dbUser._id } },
        {
          $lookup: {
            from: "reports",
            localField: "reportId",
            foreignField: "_id",
            as: "report",
          },
        },
        { $unwind: { path: "$report", preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    // === CLAIMS RECEIVED ON USER'S REPORTS (Reporter view) ===
    const userReports = await db
      .collection("reports")
      .find({ reporterId: userId })
      .toArray();

    const reportIds = userReports.map((r) => r._id);

    const claimsReceived = await db
      .collection("claims")
      .aggregate([
        { $match: { reportId: { $in: reportIds } } },
        {
          $lookup: {
            from: "reports",
            localField: "reportId",
            foreignField: "_id",
            as: "report",
          },
        },
        { $unwind: { path: "$report", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "claimantId",
            foreignField: "_id",
            as: "claimantUser",
          },
        },
        {
          $unwind: { path: "$claimantUser", preserveNullAndEmptyArrays: true },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    const serializeClaim = (c: any) => ({
      _id: c._id.toString(),
      reportId: c.reportId.toString(),
      reportTitle:
        c.report?.description?.slice(0, 60) + "..." || "Lost/Found Item",
      claimantName: c.claimantName,
      claimantEmail: c.claimantEmail,
      claimantPhone: c.claimantUser?.phone || null,
      reporterWhatsapp: c.report?.whatsappNumber || null, // ← Now included!
      description: c.description,
      proofImage: c.proofImage || null,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    });

    return NextResponse.json({
      claimsMade: claimsMade.map(serializeClaim),
      claimsReceived: claimsReceived.map(serializeClaim),
    });
  } catch (error: any) {
    console.error("GET /api/claims error:", error);
    return NextResponse.json(
      { error: "Failed to load claims" },
      { status: 500 },
    );
  }
}

// POST remains unchanged — already perfect
export async function POST(request: Request) {
  // ... your existing POST code (unchanged)
}

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
        {
          $lookup: {
            from: "users",
            localField: "report.reporterId",
            foreignField: "clerkId",
            as: "reporterUser",
          },
        },
        {
          $unwind: { path: "$reporterUser", preserveNullAndEmptyArrays: true },
        },
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
      reporterEmail: c.reporterUser?.email || null,
      reporterName: c.reporterUser?.name || null,
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

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const reportId = formData.get("reportId") as string;
    const description = formData.get("description") as string;
    const file = formData.get("image") as File | null;

    if (!reportId || !description?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    const today = new Date().toISOString().split("T")[0];

    // === DAILY CLAIM LIMIT (3 per day) ===
    const DAILY_CLAIM_LIMIT = 3;

    const stats = await db.collection("userStats").findOne({ clerkId: userId });
    const todayClaims = stats?.dailyClaims?.[today] || 0;

    if (todayClaims >= DAILY_CLAIM_LIMIT) {
      return NextResponse.json(
        {
          error:
            "You've reached the daily claim limit (3 per day). Try again tomorrow!",
        },
        { status: 429 },
      );
    }

    // === Get or create DB user ===
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

    // === Validate report ===
    const report = await db.collection("reports").findOne({
      _id: new ObjectId(reportId),
      status: "open",
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found or already claimed" },
        { status: 404 },
      );
    }

    if (report.reporterId === userId) {
      return NextResponse.json(
        { error: "You cannot claim your own report" },
        { status: 400 },
      );
    }

    // === Upload image ===
    let proofImage = null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "tracevault/claims" }, (err, res) =>
            err ? reject(err) : resolve(res),
          )
          .end(buffer);
      });
      proofImage = (result as any).secure_url;
    }

    // === Create claim ===
    const claim = {
      reportId: new ObjectId(reportId),
      claimantId: dbUser._id,
      claimantName: dbUser.name,
      claimantEmail: dbUser.email,
      description: description.trim(),
      proofImage,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("claims").insertOne(claim);

    // === Increment daily counter AFTER successful claim ===
    await db.collection("userStats").updateOne(
      { clerkId: userId },
      {
        $inc: { [`dailyClaims.${today}`]: 1 },
        $setOnInsert: { clerkId: userId },
      },
      { upsert: true },
    );

    return NextResponse.json(
      {
        message: "Claim submitted successfully!",
        claim: {
          ...claim,
          _id: result.insertedId.toString(),
          reportTitle: report.description.slice(0, 60) + "...",
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("POST /api/claims error:", error);
    return NextResponse.json(
      { error: "Failed to submit claim" },
      { status: 500 },
    );
  }
}

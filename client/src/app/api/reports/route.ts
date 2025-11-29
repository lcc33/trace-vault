// src/app/api/reports/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth, currentUser } from "@clerk/nextjs/server";

// --- Cloudinary Config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// --- Upload Helper ---
async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = "tracevault"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else if (result?.secure_url) resolve(result.secure_url);
        else reject(new Error("Upload failed"));
      }
    );
    uploadStream.end(buffer);
  });
}

// --- Constants ---
const VALID_CATEGORIES = [
  "electronics",
  "documents",
  "clothing",
  "accessories",
  "bags",
  "keys",
  "other",
] as const;

const DAILY_POST_LIMIT = 5;

// --- Validation ---
function validateCategory(cat: string): cat is typeof VALID_CATEGORIES[number] {
  return VALID_CATEGORIES.includes(cat as any);
}

function validateDescription(desc: string) {
  const t = desc.trim();
  if (!t) return "Description is required";
  if (t.length < 10) return "Description too short (min 10 chars)";
  if (t.length > 1000) return "Description too long (max 1000 chars)";
  return null;
}

function validatePhone(phone: string | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^0-9+]/g, "");
  if (cleaned.length < 10 || cleaned.length > 15) return null;
  return cleaned;
}

// --- POST: Create Report ---
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const formData = await req.formData();
    const description = (formData.get("description") as string) || "";
    const category = (formData.get("category") as string) || "";
    const whatsappNumber = (formData.get("whatsappNumber") as string) || null;
    const file = formData.get("image") as File | null;

    // --- Validation ---
    const descError = validateDescription(description);
    if (descError) return NextResponse.json({ error: descError }, { status: 400 });

    if (!validateCategory(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const phone = validatePhone(whatsappNumber);

    // --- Daily Post Limit ---
    const client = await clientPromise;
    const db = client.db("tracevault");

    const today = new Date().toISOString().split("T")[0];
    const userStats = await db.collection("userStats").findOne({ clerkId: userId });

    const todayPostCount = userStats?.dailyPosts?.[today] || 0;
    if (todayPostCount >= DAILY_POST_LIMIT) {
      return NextResponse.json(
        { error: `Daily limit reached: ${DAILY_POST_LIMIT} posts per day` },
        { status: 429 }
      );
    }

    // --- Image Upload ---
    let imageUrl: string | null = null;
    if (file && file.size > 0) {
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
      }
      if (file.size > 8 * 1024 * 1024) {
        return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 413 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      imageUrl = await uploadBufferToCloudinary(buffer);
    }

    // --- Save Report ---
    const report = {
      reporterId: userId,
      description,
      category,
      whatsappNumber: phone,
      imageUrl,
      status: "open" as const,
      user: {
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "Anonymous",
        email: clerkUser.primaryEmailAddress?.emailAddress,
        profilePic: clerkUser.imageUrl,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("reports").insertOne(report);

    // --- Update daily counter ---
    await db.collection("userStats").updateOne(
      { clerkId: userId },
      {
        $inc: { [`dailyPosts.${today}`]: 1 },
        $setOnInsert: { clerkId: userId },
      },
      { upsert: true }
    );

    // TTL index (run once in MongoDB):
    // db.userStats.createIndex({ "dailyPosts": 1 }, { expireAfterSeconds: 86400 * 7 })

    return NextResponse.json(
      {
        message: "Report created successfully",
        report: { ...report, _id: result.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

// --- GET: List Reports ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const status = searchParams.get("status") || "open";
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    const filter: any = { status };
    if (category && category !== "all") filter.category = category;
    if (q) {
      filter.$text = { $search: q };
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    // Create text index once:
    // db.reports.createIndex({ description: "text" })

    const reports = await db
      .collection("reports")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const total = await db.collection("reports").countDocuments(filter);

    const serialized = reports.map((r: any) => ({
      _id: r._id.toString(),
      reporterId: r.reporterId,
      description: r.description,
      category: r.category,
      whatsappNumber: r.whatsappNumber,
      imageUrl: r.imageUrl,
      status: r.status,
      user: r.user,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({
      reports: serialized,
      pagination: {
        page,
        limit,
        total,
        hasNext: page * limit < total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
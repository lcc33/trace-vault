// src/app/api/reports/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/mongodb"; 

// --- Cloudinary Config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// --- Upload Helper ---
async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = "tracevault",
  timeoutMs = 30000,
  retries = 2,
): Promise<any> {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(
          () => reject(new Error("UploadTimeout")),
          timeoutMs,
        );

        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, timeout: timeoutMs, resource_type: "auto" },
          (error, result) => {
            clearTimeout(timeoutId);
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("No result"));
          },
        );

        uploadStream.end(buffer);
      });
    } catch (error: any) {
      if (attempt === retries + 1) throw error;
      console.log(`Upload attempt ${attempt} failed, retrying...`);
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

// --- Validation ---
const VALID_CATEGORIES = [
  "electronics",
  "documents",
  "clothing",
  "accessories",
  "bags",
  "keys",
  "other",
];

function validateCategory(cat: string): boolean {
  return VALID_CATEGORIES.includes(cat);
}

function validateDescription(desc: string): {
  isValid: boolean;
  error?: string;
} {
  const t = desc.trim();
  if (!t) return { isValid: false, error: "Description is required" };
  if (t.length < 5) return { isValid: false, error: "Min 5 characters" };
  if (t.length > 1000) return { isValid: false, error: "Max 1000 characters" };
  return { isValid: true };
}

// --- POST: Create Report ---
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const description = (formData.get("description") as string)?.trim() || "";
    const category = (formData.get("category") as string) || "other";
    const file = formData.get("image") as File | null;

    // --- Validation ---
    const descVal = validateDescription(description);
    if (!descVal.isValid) {
      return NextResponse.json({ error: descVal.error }, { status: 400 });
    }
    if (!validateCategory(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    let imageUrl: string | null = null;

    // --- Image Upload ---
    if (file) {
      const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_BYTES || "5242880", 10);
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type" },
          { status: 400 },
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File too large (> ${MAX_SIZE / 1024 / 1024}MB)` },
          { status: 413 },
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadBufferToCloudinary(buffer);
      imageUrl = result?.secure_url ?? null;
    }

    // --- Create Report ---
    const report = {
      reporterId: userId,
      description,
      category,
      imageUrl,
      status: "open" as const,
      user: {
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          clerkUser.username ||
          "Anonymous",
        email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
        profilePic: clerkUser.imageUrl,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("reports").insertOne(report);

    return NextResponse.json(
      {
        message: "Report created",
        report: { ...report, _id: result.insertedId.toString() },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// --- GET: List Reports ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "open";
    const reporterId = searchParams.get("reporterId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

    const client = await clientPromise;
    const db = client.db("tracevault");

    const filter: any = { status };
    if (category && category !== "all") filter.category = category;
    if (reporterId) filter.reporterId = reporterId;

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

      imageUrl: r.imageUrl,
      status: r.status,
      user: r.user,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
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
      { status: 500 },
    );
  }
}

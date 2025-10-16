// app/api/reports/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: upload buffer to Cloudinary with timeout
async function uploadBufferToCloudinary(buffer: Buffer, folder = "tracevault", timeoutMs = 8000) {
  const upload = () =>
    new Promise<any>((resolve, reject) => {
      try {
        const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
        stream.end(buffer);
      } catch (err) {
        reject(err);
      }
    });

  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("UploadTimeout")), timeoutMs)
  );

  return Promise.race([upload(), timeout]) as Promise<any>;
}

// Helper: validate file size
async function validateFileSize(file: File, maxSizeBytes: number): Promise<boolean> {
  try {
    const size = (file as any).size ?? Buffer.byteLength(await file.arrayBuffer());
    return size <= maxSizeBytes;
  } catch (err) {
    console.warn("Could not determine file size, proceeding with upload");
    return true; // Continue if we can't determine size
  }
}

export async function POST(req: Request) {
  try {
    // Test database connection immediately
    const client = await clientPromise;
    const db = client.db("tracevault");
    await db.command({ ping: 1 }); // Quick connection test

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const description = (formData.get("description") as string)?.trim() || "";
    const category = (formData.get("category") as string) || "other";
    const file = formData.get("image") as File | null;

    // Validate required fields
    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    let imageUrl: string | null = null;

    // Handle file upload if provided (now optional)
    if (file) {
      // File upload configuration
      const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_BYTES || "5242880", 10); // 5MB default
      const UPLOAD_TIMEOUT_MS = parseInt(process.env.CLOUDINARY_UPLOAD_TIMEOUT_MS || "8000", 10);

      const isValidSize = await validateFileSize(file, MAX_FILE_SIZE);
      if (!isValidSize) {
        return NextResponse.json({ error: "File too large" }, { status: 413 });
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadResult = await uploadBufferToCloudinary(buffer, "tracevault", UPLOAD_TIMEOUT_MS);
        imageUrl = uploadResult?.secure_url ?? null;
      } catch (err: any) {
        console.error("Cloudinary upload failed or timed out:", err);
        if (err?.message === "UploadTimeout") {
          return NextResponse.json({ error: "Upload timed out" }, { status: 504 });
        }
        return NextResponse.json({ error: "Failed to upload image" }, { status: 502 });
      }
    }

    // Get user from database
    const user = await db.collection("users").findOne({ 
      email: session.user.email 
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create report document (no contact field)
    const report = {
      description,
      category,
      imageUrl, // Can be null if no image
      userId: user._id,
      user: {
        name: user.name,
        email: user.email,
        profilePic: user.image || user.profilePic,
      },
      createdAt: new Date(),
    };

    const result = await db.collection("reports").insertOne(report);

    return NextResponse.json(
      { 
        message: "Report saved", 
        report: { ...report, _id: result.insertedId } 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Error creating report:", error);
    
    // Specific MongoDB connection errors
    if (error.name === 'MongoServerSelectionError' || 
        error.name === 'MongoNetworkError' ||
        error.name === 'MongoTimeoutError') {
      return NextResponse.json(
        { error: "Database temporarily unavailable. Please try again." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("tracevault");

    const reports = await db
      .collection("reports")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Serialize MongoDB documents for JSON response
    const serializedReports = reports.map((report: any) => ({
      ...report,
      _id: report._id.toString(),
      userId: report.userId.toString(),
      createdAt: report.createdAt.toISOString(),
    }));

    return NextResponse.json(serializedReports);

  } catch (error: any) {
    console.error("Error fetching reports:", error);
    
    if (error.name === 'MongoServerSelectionError' || 
        error.name === 'MongoNetworkError') {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch reports" }, 
      { status: 500 }
    );
  }
}
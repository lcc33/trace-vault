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

// Enhanced upload helper with better timeout handling
async function uploadBufferToCloudinary(buffer: Buffer, folder = "tracevault", timeoutMs = 70000) {
  return new Promise<any>((resolve, reject) => {
    // Set up timeout
    const timeoutId = setTimeout(() => {
      reject(new Error("UploadTimeout"));
    }, timeoutMs);

    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder,
          timeout: timeoutMs // Cloudinary's own timeout
        },
        (error, result) => {
          clearTimeout(timeoutId); // Clear the timeout
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error("Upload failed: No result from Cloudinary"));
          }
        }
      );
      
      uploadStream.end(buffer);
    } catch (err) {
      clearTimeout(timeoutId);
      reject(err);
    }
  });
}

// Helper: validate file size
async function validateFileSize(file: File, maxSizeBytes: number): Promise<boolean> {
  try {
    const size = file.size || Buffer.byteLength(await file.arrayBuffer());
    return size <= maxSizeBytes;
  } catch (err) {
    console.warn("Could not determine file size, proceeding with upload");
    return true;
  }
}

export async function POST(req: Request) {
  try {
    // Test database connection immediately
    const client = await clientPromise;
    const db = client.db("tracevault");
    await db.command({ ping: 1 });

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

    // Handle file upload if provided
    if (file) {
      // File upload configuration - increased timeouts
      const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_BYTES || "10485760", 10); // 10MB default
      const UPLOAD_TIMEOUT_MS = parseInt(process.env.CLOUDINARY_UPLOAD_TIMEOUT_MS || "30000", 10); // 30 seconds

      console.log(`Starting file upload: ${file.name}, size: ${file.size}, timeout: ${UPLOAD_TIMEOUT_MS}ms`);

      const isValidSize = await validateFileSize(file, MAX_FILE_SIZE);
      if (!isValidSize) {
        return NextResponse.json({ 
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
        }, { status: 413 });
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        console.log("Uploading to Cloudinary...");
        const uploadResult = await uploadBufferToCloudinary(buffer, "tracevault", UPLOAD_TIMEOUT_MS);
        imageUrl = uploadResult?.secure_url ?? null;
        console.log("Cloudinary upload successful:", imageUrl);
        
      } catch (err: any) {
        console.error("Cloudinary upload failed:", err);
        
        if (err?.message === "UploadTimeout") {
          return NextResponse.json({ 
            error: "Image upload timed out. Please try with a smaller file or try again later." 
          }, { status: 504 });
        }
        
        // More specific error messages
        if (err?.message?.includes("File size too large")) {
          return NextResponse.json({ 
            error: "Image file is too large for Cloudinary" 
          }, { status: 413 });
        }
        
        if (err?.message?.includes("Invalid image file")) {
          return NextResponse.json({ 
            error: "Invalid image file format" 
          }, { status: 400 });
        }
        
        return NextResponse.json({ 
          error: "Failed to upload image. Please try again." 
        }, { status: 502 });
      }
    }

    // Get user from database
    const user = await db.collection("users").findOne({ 
      email: session.user.email 
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create report document
    const report = {
      description,
      category,
      imageUrl,
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
        message: "Report saved successfully", 
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
      { error: "Internal server error. Please try again." }, 
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
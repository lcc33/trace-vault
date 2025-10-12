import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const file = formData.get("image") as File | null;

    let imageUrl = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadRes = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "tracevault" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      imageUrl = uploadRes.secure_url;
    }

    const client = await clientPromise;
    const db = client.db("tracevault");
    
    // Get user from database
    const user = await db.collection("users").findOne({ 
      email: session.user.email 
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const report = { 
      description, 
      category, 
      imageUrl, 
      userId: user._id, // Store user reference
      user: { // Denormalize user data for easy access
        name: user.name,
        email: user.email,
        profilePic: user.image
      },
      createdAt: new Date() 
    };

    const result = await db.collection("reports").insertOne(report);
    
    return NextResponse.json({ 
      message: "Report saved", 
      report: { ...report, _id: result.insertedId } 
    });
  } catch (error: any) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }
}

// ✅ GET endpoint to fetch reports with user data
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("tracevault");

    const reports = await db
      .collection("reports")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
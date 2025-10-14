import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // Fetch claims made by the user
    const claimsMade = await db.collection("claims")
      .find({ claimantId: user._id })
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch claims received on user's reports
    const userReports = await db.collection("reports")
      .find({ userId: user._id })
      .toArray();

    const userReportIds = userReports.map(report => report._id);
    
    const claimsReceived = await db.collection("claims")
      .find({ reportId: { $in: userReportIds } })
      .sort({ createdAt: -1 })
      .toArray();

    // Serialize the data
    const serializedClaimsMade = claimsMade.map(claim => ({
      ...claim,
      _id: claim._id.toString(),
      createdAt: claim.createdAt.toISOString(),
      updatedAt: claim.updatedAt?.toISOString() || null
    }));

    const serializedClaimsReceived = claimsReceived.map(claim => ({
      ...claim,
      _id: claim._id.toString(),
      createdAt: claim.createdAt.toISOString(),
      updatedAt: claim.updatedAt?.toISOString() || null
    }));

    return NextResponse.json({
      claimsMade: serializedClaimsMade,
      claimsReceived: serializedClaimsReceived
    });

  } catch (error: any) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const reportId = formData.get("reportId") as string;
    const description = formData.get("description") as string;
    const file = formData.get("image") as File | null;

    if (!reportId || !description) {
      return NextResponse.json(
        { error: "Report ID and description are required" }, 
        { status: 400 }
      );
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

    // Verify report exists
    const report = await db.collection("reports").findOne({ 
      _id: new ObjectId(reportId) 
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check if user is claiming their own report
    if (report.userId.toString() === user._id.toString()) {
      return NextResponse.json(
        { error: "You cannot claim your own report" }, 
        { status: 400 }
      );
    }

    let proofImageUrl = null;
    
    // Upload image to Cloudinary if provided
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadRes = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "tracevault/claims" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      proofImageUrl = uploadRes.secure_url;
    }

    // Create claim
    const claim = {
      reportId: new ObjectId(reportId),
      claimantId: user._id,
      claimantName: user.name,
      claimantEmail: user.email,
      description,
      proofImage: proofImageUrl,
      status: "pending", // pending, approved, rejected
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("claims").insertOne(claim);

    return NextResponse.json(
      { 
        message: "Claim submitted successfully", 
        claim: { ...claim, _id: result.insertedId } 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Error creating claim:", error);
    return NextResponse.json(
      { error: "Failed to submit claim" }, 
      { status: 500 }
    );
  }
}
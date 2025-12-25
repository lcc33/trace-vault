// src/app/api/user/status/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    const dbUser = await db.collection("users").findOne({ clerkId: userId });

    return NextResponse.json({
      whatsappNumber: dbUser?.whatsappNumber || null,
    });
  } catch (error) {
    console.error("GET /api/user/status error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// src/app/api/user/whatsapp/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { whatsappNumber } = await request.json();

    const cleaned = whatsappNumber.replace(/[^0-9+]/g, "");
    if (cleaned.length < 10) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("tracevault");

    await db
      .collection("users")
      .updateOne(
        { clerkId: userId },
        { $set: { whatsappNumber: cleaned } },
        { upsert: true },
      );

    return NextResponse.json({ success: true, whatsappNumber: cleaned });
  } catch (error) {
    console.error("POST /api/user/whatsapp error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

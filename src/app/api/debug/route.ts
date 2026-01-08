// app/api/test-db/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("tracevault");
    const result = await db.command({ ping: 1 });
    return NextResponse.json({ 
      status: "success", 
      message: "Connected to MongoDB server",
      ping: result 
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: "error ti wa ohhh", 
        message: "Failed to connect to MongoDB Atlas",
        error: error.message 
      },
      { status: 500 }
    );
  }
}
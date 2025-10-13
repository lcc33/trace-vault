import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing report id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("tracevault");
    const report = await db.collection("reports").findOne({ _id: new (require("mongodb").ObjectId)(id) });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    if (report.user?.email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await db.collection("reports").deleteOne({ _id: new (require("mongodb").ObjectId)(id) });
    return NextResponse.json({ message: "Report deleted" });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}

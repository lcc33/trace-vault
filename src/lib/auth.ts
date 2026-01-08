// src/lib/auth.ts
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

let db: any = null;

// Helper to get DB instance
async function getDb() {
  if (!db) {
    const client = await clientPromise;
    db = client.db("tracevault");
  }
  return db;
}

export async function validateUserAccess(reportId: string, userId: string) {
  try {
    const database = await getDb();

    // Validate ObjectId
    if (!ObjectId.isValid(reportId)) return null;

    const report = await database.collection("reports").findOne({
      _id: new ObjectId(reportId),
    });

    if (!report) return null;

    // User owns the report?
    if (report.reporterId === userId) {
      return report;
    }

    // Or has an active claim?
    const claim = await database.collection("claims").findOne({
      reportId: new ObjectId(reportId),
      claimantId: userId, // assuming claimantId is the Clerk user ID
      status: { $in: ["pending", "approved"] },
    });

    return claim ? report : null;
  } catch (error) {
    console.error("validateUserAccess error:", error);
    return null;
  }
}

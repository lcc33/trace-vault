import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

let db: any = null;

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

    if (!ObjectId.isValid(reportId)) return null;

    const report = await database.collection("reports").findOne({
      _id: new ObjectId(reportId),
    });

    if (!report) return null;

    if (report.reporterId === userId) {
      return report;
    }

    const claim = await database.collection("claims").findOne({
      reportId: new ObjectId(reportId),
      claimantId: userId,
      status: { $in: ["pending", "approved"] },
    });

    return claim ? report : null;
  } catch (error) {
    console.error("validateUserAccess error:", error);
    return null;
  }
}

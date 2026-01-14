// Create a file: src/lib/cleanup-job.ts
import cron from 'node-cron';
import clientPromise from "@/lib/mongodb";

export function startCleanupJob() {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      const client = await clientPromise;
      const db = client.db("tracevault");
      
      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
      
      const result = await db.collection("reports").deleteMany({
        status: "claimed",
        claimed_at: { $lt: fourDaysAgo }
      });
      
      console. log(`Deleted ${result.deletedCount} old claimed reports`);
    } catch (error) {
      console.error("Cleanup job failed:", error);
    }
  });
}
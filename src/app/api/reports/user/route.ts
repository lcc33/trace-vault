// src/app/api/reports/user/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { getCached, invalidateCache } from "@/lib/redis";
import { checkRateLimit } from "@/lib/ratelimit";

// Helper: Retry wrapper for DB operations
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit (100 reads per minute)
    const rateLimit = await checkRateLimit(userId, 'read');
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again after ${rateLimit.reset.toLocaleTimeString()}`,
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          reset: rateLimit.reset.toISOString(),
        },
        {
          status: 429,
          headers: rateLimit.headers as Record<string, string>,
        }
      );
    }

    // Use caching for user reports (5 minute TTL)
    const cacheKey = `user-reports:${userId}`;
    
    const reportsWithClaims = await getCached(
      cacheKey,
      async () => {
        const client = await clientPromise;
        const db = client.db("tracevault");

        // Find reports with retry logic
        const reports = await withRetry(async () => {
          return await db
            .collection("reports")
            .find({ reporterId: userId })
            .sort({ createdAt: -1 })
            .toArray();
        });

        // Optimize: Batch query for claim counts instead of N+1 queries
        const reportIds = reports.map(r => r._id);
        
        const claimCounts = await withRetry(async () => {
          return await db
            .collection("claims")
            .aggregate([
              { $match: { reportId: { $in: reportIds } } },
              { $group: { _id: "$reportId", count: { $sum: 1 } } },
            ])
            .toArray();
        });

        // Create a map for O(1) lookups
        const claimCountMap = new Map(
          claimCounts.map(item => [item._id.toString(), item.count])
        );

        // Add claim counts to reports
        return reports.map(report => ({
          _id: report._id.toString(),
          description: report.description,
          category: report.category,
          imageUrl: report.imageUrl || null,
          status: report.status || "open",
          createdAt: report.createdAt.toISOString(),
          updatedAt: report.updatedAt?.toISOString() || null,
          claimCount: claimCountMap.get(report._id.toString()) || 0,
        }));
      },
      300 // Cache for 5 minutes
    );

    return NextResponse.json(reportsWithClaims, {
      headers: rateLimit.headers as Record<string, string>,
    });

  } catch (error: any) {
    console.error("GET /api/reports/user error:", error);
    
    // Handle specific MongoDB errors
    if (error.name === "MongoServerError" || error.name === "MongoNetworkError") {
      return NextResponse.json(
        { error: "Database error. Please try again." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch your reports" },
      { status: 500 }
    );
  }
}
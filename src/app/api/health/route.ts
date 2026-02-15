import { NextResponse } from "next/server";
import { getPoolStats, checkMongoConnection } from "@/lib/mongodb";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const mongoHealthy = await checkMongoConnection();
    const poolStats = await getPoolStats();

    let redisHealthy = false;
    try {
      await redis.ping();
      redisHealthy = true;
    } catch (err) {
      console.error("Redis health check failed:", err);
    }

    return NextResponse.json({
      status: mongoHealthy && redisHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      mongodb: {
        connected: mongoHealthy,
        pool: poolStats,
      },
      redis: {
        connected: redisHealthy,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "unhealthy", error: "Health check failed" },
      { status: 503 },
    );
  }
}

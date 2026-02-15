import { Redis } from "@upstash/redis";

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error("Missing Upstash Redis credentials in .env.local");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300,
): Promise<T> {
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      console.log(`✓ Cache HIT: ${key}`);
      return cached;
    }

    console.log(`✗ Cache MISS: ${key}`);

    const fresh = await fetcher();

    redis
      .setex(key, ttlSeconds, fresh)
      .catch((err) => console.error("Cache set error:", err));

    return fresh;
  } catch (error) {
    console.error("Cache error, falling back to fetcher:", error);

    return await fetcher();
  }
}

export async function invalidateCache(pattern: string) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`✓ Invalidated ${keys.length} cache keys: ${pattern}`);
    }
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

export async function clearCache(key: string) {
  try {
    await redis.del(key);
    console.log(`✓ Cleared cache: ${key}`);
  } catch (error) {
    console.error("Cache clear error:", error);
  }
}

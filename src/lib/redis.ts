// src/lib/redis.ts
import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis credentials in .env.local');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache helper with automatic JSON serialization
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300 // 5 minutes default
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      console.log(`✓ Cache HIT: ${key}`);
      return cached;
    }

    console.log(`✗ Cache MISS: ${key}`);
    
    // Fetch fresh data
    const fresh = await fetcher();
    
    // Store in cache (fire and forget, don't block)
    redis.setex(key, ttlSeconds, fresh).catch(err => 
      console.error('Cache set error:', err)
    );
    
    return fresh;
  } catch (error) {
    console.error('Cache error, falling back to fetcher:', error);
    // If Redis fails, just fetch without caching
    return await fetcher();
  }
}

// Invalidate cache patterns
export async function invalidateCache(pattern: string) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`✓ Invalidated ${keys.length} cache keys: ${pattern}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// Clear specific key
export async function clearCache(key: string) {
  try {
    await redis.del(key);
    console.log(`✓ Cleared cache: ${key}`);
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}
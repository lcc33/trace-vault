// src/lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Different rate limits for different operations
export const rateLimits = {
  // Strict limit for creating reports/claims (3 per day)
  create: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(3, "24 h"),
    analytics: true,
    prefix: "ratelimit:create",
  }),

  // Medium limit for API reads (100 per minute)
  read: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "ratelimit:read",
  }),

  // Strict limit for image uploads (10 per hour)
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "ratelimit:upload",
  }),

  // General API protection (50 per 10 seconds)
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "10 s"),
    analytics: true,
    prefix: "ratelimit:general",
  }),
};

// Helper to apply rate limiting to any route
export async function checkRateLimit(
  identifier: string, // Usually userId or IP
  limitType: keyof typeof rateLimits = "general",
) {
  try {
    const { success, limit, remaining, reset } =
      await rateLimits[limitType].limit(identifier);

    return {
      success,
      limit,
      remaining,
      reset: new Date(reset),
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      } as Record<string, string>,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // If Redis fails, allow the request (fail open)
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: new Date(),
      headers: {} as Record<string, string>,
    };
  }
}

// Middleware wrapper for Next.js routes
export function withRateLimit(limitType: keyof typeof rateLimits = "general") {
  return async function (
    identifier: string,
    handler: () => Promise<Response>,
  ): Promise<Response> {
    const result = await checkRateLimit(identifier, limitType);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: `Too many requests. Try again after ${result.reset.toLocaleTimeString()}`,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset.toISOString(),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...result.headers,
          },
        },
      );
    }

    // Execute handler and add rate limit headers
    const response = await handler();
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  };
}

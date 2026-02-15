import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const rateLimits = {
  create: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(3, "24 h"),
    analytics: true,
    prefix: "ratelimit:create",
  }),

  read: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "ratelimit:read",
  }),

  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "ratelimit:upload",
  }),

  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "10 s"),
    analytics: true,
    prefix: "ratelimit:general",
  }),
};

export async function checkRateLimit(
  identifier: string,
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

    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: new Date(),
      headers: {} as Record<string, string>,
    };
  }
}

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

    const response = await handler();
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  };
}

// src/lib/api-utils.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit } from "./ratelimit";

/**
 * Retry wrapper for database operations
 * Automatically retries failed operations with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.error(`Retry attempt ${attempt}/${maxRetries} failed:`, error);

      if (attempt < maxRetries) {
        const delay = delayMs * attempt; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Standard error response handler
 * Returns appropriate HTTP status based on error type
 */
export function handleApiError(
  error: any,
  defaultMessage: string = "Internal server error",
) {
  console.error("API Error:", error);

  // MongoDB errors
  if (error.name === "MongoServerError" || error.name === "MongoNetworkError") {
    return NextResponse.json(
      { error: "Database temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }

  // Validation errors
  if (error.name === "ValidationError") {
    return NextResponse.json(
      { error: error.message || "Invalid input" },
      { status: 400 },
    );
  }

  // Auth errors
  if (
    error.message?.includes("Unauthorized") ||
    error.message?.includes("unauthenticated")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Default server error
  return NextResponse.json({ error: defaultMessage }, { status: 500 });
}

/**
 * Require authentication middleware
 * Returns userId if authenticated, otherwise returns error response
 */
export async function requireAuth(): Promise<
  { userId: string } | NextResponse
> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 },
    );
  }

  return { userId };
}

/**
 * Apply rate limiting to a route
 * Returns rate limit info or error response if exceeded
 */
export async function applyRateLimit(
  identifier: string,
  limitType: "read" | "create" | "upload" | "general" = "general",
) {
  const rateLimit = await checkRateLimit(identifier, limitType);

  
  if (!rateLimit.success) {
    return {
      error: NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Try again after ${rateLimit.reset.toLocaleTimeString()}`,
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          reset: rateLimit.reset.toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.reset.toString(),
          } as Record<string, string>,
        },
      ),
      headers: rateLimit.headers,
    };
  }

  return { headers: rateLimit.headers };
}

/**
 * Validate request body fields
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[],
): { isValid: boolean; error?: string } {
  for (const field of requiredFields) {
    if (!data[field]) {
      return {
        isValid: false,
        error: `Missing required field: ${field}`,
      };
    }
  }
  return { isValid: true };
}

/**
 * Validate text length
 */
export function validateLength(
  text: string,
  min: number,
  max: number,
  fieldName: string = "Text",
): { isValid: boolean; error?: string } {
  const length = text.trim().length;

  if (length < min) {
    return {
      isValid: false,
      error: `${fieldName} too short (min ${min} characters)`,
    };
  }

  if (length > max) {
    return {
      isValid: false,
      error: `${fieldName} too long (max ${max} characters)`,
    };
  }

  return { isValid: true };
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  maxSizeMB: number = 8,
  allowedTypes: string[] = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],
): { isValid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File too large (max ${maxSizeMB}MB)`,
    };
  }

  return { isValid: true };
}

/**
 * Upload file to Cloudinary with timeout and retry
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = "tracevault",
  timeoutMs: number = 30000,
): Promise<string> {
  const { v2: cloudinary } = await import("cloudinary");

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

  const uploadPromise = cloudinary.uploader.upload(base64Image, {
    folder,
    timeout: timeoutMs,
    resource_type: "auto",
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Upload timeout")), timeoutMs),
  );

  const result = await Promise.race([uploadPromise, timeoutPromise]);
  return result.secure_url;
}

/**
 * Example usage in a route:
 *
 * export async function GET() {
 *   try {
 *     // 1. Require auth
 *     const authResult = await requireAuth();
 *     if (authResult instanceof NextResponse) return authResult;
 *     const { userId } = authResult;
 *
 *     // 2. Apply rate limiting
 *     const rateLimitResult = await applyRateLimit(userId, 'read');
 *     if (rateLimitResult.error) return rateLimitResult.error;
 *
 *     // 3. Your logic here...
 *     const data = await withRetry(async () => {
 *       return await db.collection('items').find().toArray();
 *     });
 *
 *     return NextResponse.json(data, {
 *       headers: rateLimitResult.headers,
 *     });
 *
 *   } catch (error) {
 *     return handleApiError(error, "Failed to fetch data");
 *   }
 * }
 */

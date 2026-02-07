// src/app/api/user/delete/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { invalidateCache } from "@/lib/redis";
import {
  requireAuth,
  applyRateLimit,
  withRetry,
  handleApiError,
} from "@/lib/api-utils";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// DELETE: Delete user account and all associated data
export async function DELETE() {
  try {
    // 1. Require authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    // 2. Apply rate limiting (prevent spam deletion attempts)
    const rateLimitResult = await applyRateLimit(userId, 'general');
    if (rateLimitResult.error) return rateLimitResult.error;

    console.log(`🗑️  Starting account deletion for user: ${userId}`);

    const client = await clientPromise;
    const db = client.db("tracevault");

    // 3. Get all user's reports (to delete images from Cloudinary)
    const userReports = await withRetry(async () => {
      return await db
        .collection("reports")
        .find({ reporterId: userId })
        .toArray();
    });

    // 4. Get all user's claims (to delete proof images)
    const userClaims = await withRetry(async () => {
      return await db
        .collection("claims")
        .find({ claimantId: userId })
        .toArray();
    });

    // 5. Delete images from Cloudinary (non-blocking, best effort)
    const imageUrls = [
      ...userReports.map(r => r.imageUrl).filter(Boolean),
      ...userClaims.map(c => c.proofImage).filter(Boolean),
    ];

    if (imageUrls.length > 0) {
      console.log(`📸 Deleting ${imageUrls.length} images from Cloudinary...`);
      
      // Extract public IDs from Cloudinary URLs
      // Replace your publicIds block with this:
const publicIds = imageUrls.flatMap(url => {
  const matches = url.match(/\/tracevault\/([^/]+)\./);
  // Returning [value] adds it, returning [] skips it
  return matches ? [`tracevault/${matches[1]}`] : [];
});

      // Delete in batches (Cloudinary allows batch deletion)
      try {
        if (publicIds.length > 0) {
          await cloudinary.api.delete_resources(publicIds);
          console.log(`✓ Deleted ${publicIds.length} images`);
        }
      } catch (cloudinaryError) {
        // Don't fail the whole deletion if Cloudinary fails
        console.error("Cloudinary deletion error (non-critical):", cloudinaryError);
      }
    }

    // 6. Delete all user data from MongoDB (in order due to dependencies)
    await withRetry(async () => {
      // Delete claims on user's reports
      await db.collection("claims").deleteMany({
        reportId: { $in: userReports.map(r => r._id) }
      });

      // Delete user's own claims
      await db.collection("claims").deleteMany({
        claimantId: userId
      });

      // Delete user's reports
      await db.collection("reports").deleteMany({
        reporterId: userId
      });

      // Delete user stats
      await db.collection("userStats").deleteMany({
        clerkId: userId
      });

      // Delete user record
      await db.collection("users").deleteMany({
        clerkId: userId
      });
    });

    console.log(`✓ Deleted all data for user: ${userId}`);

    // 7. Invalidate all caches related to this user
    await Promise.all([
      invalidateCache(`user-reports:${userId}`),
      invalidateCache(`user-claims:${userId}`),
      invalidateCache(`reports:*`), // User's reports might be in public feeds
    ]);

    console.log(`✓ Invalidated caches for user: ${userId}`);

    // 8. Return success (Clerk account deletion happens on frontend)
    return NextResponse.json(
      {
        success: true,
        message: "Account data deleted successfully",
        deleted: {
          reports: userReports.length,
          claims: userClaims.length,
          images: imageUrls.length,
        },
      },
      {
        status: 200,
        headers: rateLimitResult.headers as Record<string, string>,
      }
    );

  } catch (error: any) {
    console.error("DELETE /api/user/delete error:", error);
    return handleApiError(error, "Failed to delete account data");
  }
}
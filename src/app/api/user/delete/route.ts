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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function DELETE() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const rateLimitResult = await applyRateLimit(userId, "general");
    if (rateLimitResult.error) return rateLimitResult.error;

    console.log(`Starting account deletion for user: ${userId}`);

    const client = await clientPromise;
    const db = client.db("tracevault");

    const userReports = await withRetry(async () => {
      return await db
        .collection("reports")
        .find({ reporterId: userId })
        .toArray();
    });

    const userClaims = await withRetry(async () => {
      return await db
        .collection("claims")
        .find({ claimantId: userId })
        .toArray();
    });

    const imageUrls = [
      ...userReports.map((r) => r.imageUrl).filter(Boolean),
      ...userClaims.map((c) => c.proofImage).filter(Boolean),
    ];

    if (imageUrls.length > 0) {
      console.log(`Deleting ${imageUrls.length} images from Cloudinary...`);

      const publicIds = imageUrls.flatMap((url) => {
        const matches = url.match(/\/tracevault\/([^/]+)\./);

        return matches ? [`tracevault/${matches[1]}`] : [];
      });

      try {
        if (publicIds.length > 0) {
          await cloudinary.api.delete_resources(publicIds);
          console.log(`✓ Deleted ${publicIds.length} images`);
        }
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary deletion error (non-critical):",
          cloudinaryError,
        );
      }
    }

    await withRetry(async () => {
      await db.collection("claims").deleteMany({
        reportId: { $in: userReports.map((r) => r._id) },
      });

      await db.collection("claims").deleteMany({
        claimantId: userId,
      });

      await db.collection("reports").deleteMany({
        reporterId: userId,
      });

      await db.collection("userStats").deleteMany({
        clerkId: userId,
      });

      await db.collection("users").deleteMany({
        clerkId: userId,
      });
    });

    console.log(`✓ Deleted all data for user: ${userId}`);

    await Promise.all([
      invalidateCache(`user-reports:${userId}`),
      invalidateCache(`user-claims:${userId}`),
      invalidateCache(`reports:*`),
    ]);

    console.log(`✓ Invalidated caches for user: ${userId}`);

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
      },
    );
  } catch (error: any) {
    console.error("DELETE /api/user/delete error:", error);
    return handleApiError(error, "Failed to delete account data");
  }
}

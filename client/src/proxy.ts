// src/app/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: [
    "/",
    "/about",
    "/features",
    "/how-it-works",
    "/faq",
    "/privacy",
    "/terms",
    "/community",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/help(.*)",
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|/_next).*)", "/", "/(api|trpc)(.*)"],
};
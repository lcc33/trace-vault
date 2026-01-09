// src/app/proxy.ts or middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)"],
} as any);

export const config = {
  matcher: ["/((?!.*\\..*|/_next).*)", "/", "/(api|trpc)(.*)"],
};
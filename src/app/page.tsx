// src/app/page.tsx (Landing Page)
"use client";

import { useUser, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Redirect signed-in users to /home
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/home");
    } else if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show spinner while auth is loading
  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full animate-ping">
            <div className="w-32 h-32 rounded-full bg-cyan-500/20 blur-xl" />
          </div>

          {/* Main spinner */}
          <div className="relative w-32 h-32">
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-r-cyan-400 border-b-cyan-400 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"
              style={{ animationDuration: "2s", animationDirection: "reverse" }}
            />
          </div>

          {/* Inner pulse glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/10 to-transparent animate-pulse blur-sm" />
        </div>
      </div>
    );
  } else if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full animate-ping">
            <div className="w-32 h-32 rounded-full bg-cyan-500/20 blur-xl" />
          </div>

          {/* Main spinner */}
          <div className="relative w-32 h-32">
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-r-cyan-400 border-b-cyan-400 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"
              style={{ animationDuration: "2s", animationDirection: "reverse" }}
            />
          </div>

          {/* Inner pulse glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/10 to-transparent animate-pulse blur-sm" />
        </div>
      </div>
    );
  }

  // Only reached when NOT signed in and auth loaded
  return null;
}

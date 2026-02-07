"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, WifiOff } from "lucide-react"; // Assuming you use lucide-react

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [error, setError] = useState<"timeout" | "offline" | null>(null);

  useEffect(() => {
    // 1. Handle Offline State
    if (!navigator.onLine) {
      setError("offline");
      return;
    }

    // 2. Set a timeout (8 seconds) to prevent infinite spinning
    const timer = setTimeout(() => {
      if (!isLoaded) setError("timeout");
    }, 8000);

    if (isLoaded) {
      clearTimeout(timer);
      if (isSignedIn) {
        // 3. Prefetch for "instant" feeling before replacing
        router.prefetch("/home");
        router.replace("/home");
      } else {
        router.prefetch("/sign-in");
        router.replace("/sign-in");
      }
    }

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, router]);

  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black flex flex-col items-center justify-center p-4">
      <div className="relative mb-8">
        {/* Only show spinner if there is no error */}
        {!error ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-ping">
              <div className="w-32 h-32 rounded-full bg-cyan-500/20 blur-xl" />
            </div>
            <div className="relative w-32 h-32">
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-r-cyan-400 border-b-cyan-400 animate-spin"
                style={{ animationDuration: "2s" }}
              />
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"
                style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            {error === "offline" ? (
              <WifiOff className="w-16 h-16 text-slate-500 mb-4" />
            ) : (
              <RefreshCcw className="w-16 h-16 text-cyan-500 mb-4" />
            )}
          </div>
        )}
      </div>

      {/* Dynamic Text/UI for User Feedback */}
      <div className="text-center max-w-xs">
        {!error ? (
          <>
            <h1 className="text-white font-medium text-lg animate-pulse">TraceVault</h1>
            <p className="text-slate-400 text-sm mt-2">Securing your session...</p>
          </>
        ) : (
          <>
            <h1 className="text-white font-medium text-lg">
              {error === "offline" ? "No Internet Connection" : "Connection Timeout"}
            </h1>
            <p className="text-slate-400 text-sm mt-2 mb-6">
              {error === "offline" 
                ? "Please check your data or Wi-Fi settings." 
                : "The connection is taking longer than usual."}
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-all active:scale-95 flex items-center gap-2 mx-auto"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
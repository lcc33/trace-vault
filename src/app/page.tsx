"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, WifiOff, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [error, setError] = useState<"timeout" | "offline" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !navigator.onLine) {
      setError("offline");
      return;
    }

    const timer = setTimeout(() => {
      if (!isLoaded) setError("timeout");
    }, 10000);

    if (isLoaded) {
      clearTimeout(timer);
      const target = isSignedIn ? "/home" : "/sign-in";

      router.prefetch(target);

      const redirectTimer = setTimeout(() => {
        router.replace(target);
      }, 800);

      return () => clearTimeout(redirectTimer);
    }

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, router]);

  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-12 relative">
          {!error ? (
            <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 border-2 border-cyan-500/20 rounded-full" />
              <div
                className="absolute w-24 h-24 border-t-2 border-cyan-400 rounded-full animate-spin"
                style={{ animationDuration: "0.8s" }}
              />

              <div className="relative bg-slate-900 p-4 rounded-2xl border border-white/10 shadow-2xl animate-pulse">
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 animate-in zoom-in duration-300">
              {error === "offline" ? (
                <WifiOff className="w-12 h-12 text-slate-500" />
              ) : (
                <RefreshCcw className="w-12 h-12 text-amber-500 animate-spin-slow" />
              )}
            </div>
          )}
        </div>

        <div className="text-center space-y-4">
          {!error ? (
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent tracking-tight">
                TraceVault
              </h1>
              <div className="flex flex-col items-center gap-2">
                <p className="text-slate-400 text-sm font-medium">
                  Verifying your secure session
                </p>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                </div>
              </div>
            </>
          ) : (
            <div className="max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-xl font-semibold text-white">
                {error === "offline" ? "Connection Lost" : "Taking a while..."}
              </h1>
              <p className="text-slate-400 text-sm mt-2 mb-8">
                {error === "offline"
                  ? "We can't reach the vault. Check your internet connection."
                  : "Authentication is taking longer than expected. Network might be unstable."}
              </p>
              <button
                onClick={handleRetry}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-cyan-400 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/10"
              >
                <RefreshCcw className="w-5 h-5" />
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

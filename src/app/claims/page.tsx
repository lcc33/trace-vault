"use client";

import { useUser, SignedOut, SignedIn, RedirectToSignIn } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Navbar } from "@/components";
import { useRouter } from "next/navigation";
import ClaimsTabs from "./components/ClaimTabs";
import ReceivedClaims from "./components/RecievedClaims";
import MadeClaims from "./components/MadeClaims";
import EnlargedImageModal from "./components/EnlargedImageModal";
import type { Claim } from "./types";
import { AlertCircle } from "lucide-react";

function ClaimsPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        <div className="h-9 bg-slate-800 rounded-lg w-64 mb-8 animate-pulse mx-auto sm:mx-0" />
        <div className="flex gap-4 mb-6 border-b border-slate-700 pb-2">
          <div className="h-10 bg-slate-800 rounded-lg w-32 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg w-32 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 animate-pulse"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-48 h-48 bg-slate-700 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-slate-700 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-full" />
                    <div className="h-4 bg-slate-700 rounded w-5/6" />
                    <div className="h-4 bg-slate-700 rounded w-4/6" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-4 bg-slate-700 rounded w-20" />
                    <div className="h-4 bg-slate-700 rounded w-24" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <div className="h-10 bg-slate-700 rounded-lg w-24" />
                    <div className="h-10 bg-slate-700 rounded-lg w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ClaimsPage() {
  const { user, isLoaded } = useUser();
  const [claimsMade, setClaimsMade] = useState<Claim[]>([]);
  const [claimsReceived, setClaimsReceived] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<"made" | "received">("received");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserClaims();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  const fetchUserClaims = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/claims");

      if (!res.ok) {
        if (res.status === 429) {
          const data = await res.json();
          const resetTime = data.reset
            ? new Date(data.reset).toLocaleTimeString()
            : "later";
          throw new Error(`Too many requests. Try again after ${resetTime}`);
        } else if (res.status === 503) {
          throw new Error(
            "Service temporarily unavailable. Please try again in a moment.",
          );
        } else if (res.status >= 500) {
          throw new Error("Server error. Please try again.");
        } else {
          throw new Error("Failed to fetch claims");
        }
      }

      const data = await res.json();
      setClaimsMade(data.claimsMade || []);
      setClaimsReceived(data.claimsReceived || []);
    } catch (error) {
      console.error("Error fetching claims:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to load claims. Please try again.";
      setError(errorMsg);

      if (
        errorMsg.includes("temporarily unavailable") ||
        errorMsg.includes("Network")
      ) {
        setTimeout(() => {
          fetchUserClaims();
        }, 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAction = async (
    claimId: string,
    action: "approve" | "reject",
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();

        if (res.status === 429) {
          const resetTime = data.reset
            ? new Date(data.reset).toLocaleTimeString()
            : "later";
          throw new Error(`Rate limit exceeded. Try again after ${resetTime}`);
        } else if (res.status >= 500) {
          throw new Error("Server error. Please try again.");
        } else {
          throw new Error(data.error || "Failed to update claim");
        }
      }

      await fetchUserClaims();

      setError(null);
    } catch (error) {
      console.error("Error updating claim:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to update claim";
      alert(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const markReportAsClaimed = async (reportId: string) => {
    if (
      !confirm(
        "Mark this report as claimed? This will close it and prevent new claims.",
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "claimed" }),
      });

      if (!res.ok) {
        const data = await res.json();

        if (res.status === 429) {
          const resetTime = data.reset
            ? new Date(data.reset).toLocaleTimeString()
            : "later";
          throw new Error(`Rate limit exceeded. Try again after ${resetTime}`);
        } else if (res.status >= 500) {
          throw new Error("Server error. Please try again.");
        } else {
          throw new Error(data.error || "Failed to mark as claimed");
        }
      }

      await fetchUserClaims();
      alert("Report marked as claimed!");
    } catch (error) {
      console.error("Error marking report:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to update report";
      alert(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return <ClaimsPageSkeleton />;
  }

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-slate-900 text-slate-100">
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8 pb-24 lg:pb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center sm:text-left">
              Claims Management
            </h1>

            <ClaimsTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              madeCount={claimsMade.length}
              receivedCount={claimsReceived.length}
            />

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-2xl mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base">{error}</p>
                  {!error.includes("temporarily unavailable") && (
                    <button
                      onClick={fetchUserClaims}
                      className="mt-2 text-xs sm:text-sm text-red-300 hover:text-red-200 underline"
                    >
                      Try again
                    </button>
                  )}
                  {error.includes("temporarily unavailable") && (
                    <p className="mt-1 text-xs text-red-300">
                      Automatically retrying...
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300 p-1"
                  aria-label="Dismiss error"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            {actionLoading && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-slate-800 rounded-2xl p-6 flex items-center gap-3 shadow-2xl">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500" />
                  <p className="text-white font-medium">Processing...</p>
                </div>
              </div>
            )}

            {activeTab === "received" ? (
              <ReceivedClaims
                claims={claimsReceived}
                onApprove={(id) => handleClaimAction(id, "approve")}
                onReject={(id) => handleClaimAction(id, "reject")}
                onMarkClaimed={markReportAsClaimed}
                onEnlargeImage={setEnlargedImage}
              />
            ) : (
              <MadeClaims
                claims={claimsMade}
                onEnlargeImage={setEnlargedImage}
              />
            )}
          </main>

          <EnlargedImageModal
            imageUrl={enlargedImage}
            onClose={() => setEnlargedImage(null)}
          />
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

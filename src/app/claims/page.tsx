// src/app/claims/page.tsx
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

// Loading skeleton component
function ClaimsPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Title skeleton */}
        <div className="h-9 bg-slate-800 rounded-lg w-64 mb-8 animate-pulse mx-auto sm:mx-0" />

        {/* Tabs skeleton */}
        <div className="flex gap-4 mb-6 border-b border-slate-700 pb-2">
          <div className="h-10 bg-slate-800 rounded-lg w-32 animate-pulse" />
          <div className="h-10 bg-slate-800 rounded-lg w-32 animate-pulse" />
        </div>

        {/* Claims cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 animate-pulse"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Image skeleton */}
                <div className="w-full sm:w-48 h-48 bg-slate-700 rounded-xl flex-shrink-0" />
                
                <div className="flex-1 space-y-3">
                  {/* Header skeleton */}
                  <div className="h-6 bg-slate-700 rounded w-3/4" />
                  
                  {/* Description skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-full" />
                    <div className="h-4 bg-slate-700 rounded w-5/6" />
                    <div className="h-4 bg-slate-700 rounded w-4/6" />
                  </div>
                  
                  {/* Meta info skeleton */}
                  <div className="flex gap-2">
                    <div className="h-4 bg-slate-700 rounded w-20" />
                    <div className="h-4 bg-slate-700 rounded w-24" />
                  </div>
                  
                  {/* Buttons skeleton */}
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
        throw new Error("Failed to fetch claims");
      }
      
      const data = await res.json();
      setClaimsMade(data.claimsMade || []);
      setClaimsReceived(data.claimsReceived || []);
    } catch (error) {
      console.error("Error fetching claims:", error);
      setError("Failed to load claims. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAction = async (
    claimId: string,
    action: "approve" | "reject"
  ) => {
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update claim");
      }
      
      // Refresh claims after action
      await fetchUserClaims();
      
      // Show success feedback
      const successMsg = action === "approve" 
        ? "Claim approved! You can now contact the claimer."
        : "Claim rejected.";
      
      // You could add a toast notification here
      console.log(successMsg);
      
    } catch (error) {
      console.error("Error updating claim:", error);
      alert(error instanceof Error ? error.message : "Failed to update claim");
    }
  };

  const markReportAsClaimed = async (reportId: string) => {
    if (!confirm("Mark this report as claimed? This will close it and prevent new claims.")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "claimed" }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark as claimed");
      }
      
      await fetchUserClaims();
      alert("Report marked as claimed!");
      
    } catch (error) {
      console.error("Error marking report:", error);
      alert(error instanceof Error ? error.message : "Failed to update report");
    }
  };

  // Show skeleton while loading
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

            {/* Error state */}
            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-2xl mb-6 flex items-start gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-medium">{error}</p>
                  <button
                    onClick={fetchUserClaims}
                    className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Claims content */}
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
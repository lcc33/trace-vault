// src/app/claims/page.tsx
"use client";

import { useUser, SignedOut, SignedIn, RedirectToSignIn } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Navbar } from "@/components";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ClaimsTabs from "./components/ClaimTabs";
import ReceivedClaims from "./components/RecievedClaims";
import MadeClaims from "./components/MadeClaims";
import EnlargedImageModal from "./components/EnlargedImageModal";
import type { Claim } from "./types";

export default function ClaimsPage() {
  const { user, isLoaded } = useUser();
  const [claimsMade, setClaimsMade] = useState<Claim[]>([]);
  const [claimsReceived, setClaimsReceived] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<"made" | "received">("received");
  const [loading, setLoading] = useState(true);
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
    try {
      const res = await fetch("/api/claims");
      const data = await res.json();
      setClaimsMade(data.claimsMade || []);
      setClaimsReceived(data.claimsReceived || []);
    } catch (error) {
      console.error("Error:", error);
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
      if (res.ok) fetchUserClaims();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const markReportAsClaimed = async (reportId: string) => {
    if (!confirm("Mark this report as claimed? This will close it.")) return;
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "claimed" }),
      });
      if (res.ok) {
        fetchUserClaims();
        alert("Report marked as claimed!");
      }
    } catch {
      alert("Failed to update report");
    }
  };


  

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading claims...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-slate-900 text-slate-100">
          <Navbar />
          <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">
              Claims Management
            </h1>

            <ClaimsTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              madeCount={claimsMade.length}
              receivedCount={claimsReceived.length}
            />

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
          </div>

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

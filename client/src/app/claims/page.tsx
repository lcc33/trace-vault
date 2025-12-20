// src/app/claims/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Navbar } from "@/components";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

interface Claim {
  _id: string;
  reportId: string;
  reportTitle?: string;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string; // Add this to your Claim model
  description: string;
  proofImage?: any;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function ClaimsPage() {
  const { user, isLoaded } = useUser();
  const [claimsMade, setClaimsMade] = useState<Claim[]>([]);
  const [claimsReceived, setClaimsReceived] = useState<Claim[]>([]);
  const [activeTab, setActiveTab] = useState<"made" | "received">("received");
  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) fetchUserClaims();
  }, [isLoaded, user]);

  const fetchUserClaims = async () => {
    try {
      const res = await fetch("/api/claims");
      const data = await res.json();
      setClaimsMade(data.claimsMade || []);
      setClaimsReceived(data.claimsReceived || []);
    } catch (error) {
      console.error("Error fetching claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAction = async (
    claimId: string,
    action: "approve" | "reject",
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

  // Mark report as claimed (reporter only)
  const markReportAsClaimed = async (reportId: string) => {
    if (!confirm("Mark this report as claimed? This will close it.")) return;

    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "claimed" }),
      });
      if (res.ok) {
        fetchUserClaims(); // Refresh
        alert("Report marked as claimed!");
      }
    } catch (error) {
      alert("Failed to update report");
    }
  };
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <p className="text-center">
          Please{" "}
          <Link href="/sign-in" className="text-sky-400 hover:underline">
            sign in
          </Link>{" "}
          to view your profile.
        </p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading claims...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">
          Claims Management
        </h1>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row border-b border-slate-700 mb-8">
          <button
            onClick={() => setActiveTab("received")}
            className={`px-6 py-3 font-medium text-center transition-colors relative ${
              activeTab === "received"
                ? "text-sky-400 border-b-2 border-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Claims on My Reports ({claimsReceived.length})
          </button>
          <button
            onClick={() => setActiveTab("made")}
            className={`px-6 py-3 font-medium text-center transition-colors relative ${
              activeTab === "made"
                ? "text-sky-400 border-b-2 border-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            My Claims ({claimsMade.length})
          </button>
        </div>

        {/* === CLAIMS RECEIVED (Reporter View) === */}
        {activeTab === "received" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-sky-300">
              Claims on Your Reports
            </h2>
            {claimsReceived.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                <Clock className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 text-lg">
                  No one has claimed your items yet.
                </p>
              </div>
            ) : (
              claimsReceived.map((claim) => (
                <div
                  key={claim._id}
                  className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                    <div>
                      <Link
                        href={`/report/${claim.reportId}`}
                        className="text-sky-400 hover:text-sky-300 font-semibold text-lg flex items-center gap-2 group"
                      >
                        {claim.reportTitle || "View Report"}
                        <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                      </Link>
                      <p className="text-sm text-slate-400 mt-1">
                        Claimed by: <strong>{claim.claimantName}</strong> •{" "}
                        {claim.claimantEmail}
                      </p>
                    </div>

                    <div
                      className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                        claim.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                          : claim.status === "approved"
                            ? "bg-green-500/20 text-green-400 border border-green-500/50"
                            : "bg-red-500/20 text-red-400 border border-red-500/50"
                      }`}
                    >
                      {claim.status === "pending" && (
                        <Clock className="w-4 h-4" />
                      )}
                      {claim.status === "approved" && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {claim.status === "rejected" && (
                        <XCircle className="w-4 h-4" />
                      )}
                      {claim.status.toUpperCase()}
                    </div>
                  </div>

                  <p className="text-slate-300 mb-4">{claim.description}</p>

                  {claim.proofImage && (
                    <Image
                      src={claim.proofImage}
                      alt="Proof"
                      width={800}
                      height={600}
                      className="rounded-xl border border-slate-700 w-full max-h-96 object-cover cursor-pointer hover:opacity-90 mb-5"
                      unoptimized
                      onClick={() => setEnlargedImage(claim.proofImage)}
                    />
                  )}

                  {/* Actions */}
                  {claim.status === "pending" && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleClaimAction(claim._id, "approve")}
                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" /> Approve Claim
                      </button>
                      <button
                        onClick={() => handleClaimAction(claim._id, "reject")}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" /> Reject Claim
                      </button>
                    </div>
                  )}

                  {/* WhatsApp Button — Only when approved */}
                  {claim.status === "approved" && claim.claimantPhone && (
                    <div className="mt-4">
                      <a
                        href={`https://wa.me/${claim.claimantPhone.replace(/[^0-9]/g, "")}?text=Hi ${encodeURIComponent(claim.claimantName)}, your claim on "${claim.reportTitle || "my item"}" was approved! Let's arrange pickup.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl transition-all transform hover:scale-105"
                      >
                        <MessageCircle className="w-6 h-6" />
                        Message on WhatsApp
                      </a>

                      <button
                        onClick={() => markReportAsClaimed(claim.reportId)}
                        className="ml-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition"
                      >
                        Mark Report as Claimed
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* === MY CLAIMS (Claimant View) === */}
        {activeTab === "made" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-sky-300">Your Claims</h2>
            {claimsMade.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                <Clock className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 text-lg">
                  You haven't claimed any items yet.
                </p>
              </div>
            ) : (
              claimsMade.map((claim) => (
                <div
                  key={claim._id}
                  className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <Link
                        href={`/report/${claim.reportId}`}
                        className="text-sky-400 hover:text-sky-300 font-semibold text-lg flex items-center gap-2 group"
                      >
                        {claim.reportTitle || "View Report"}
                        <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                      </Link>
                      <p className="text-sm text-slate-400 mt-2">
                        Submitted{" "}
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div
                      className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                        claim.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : claim.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {claim.status === "pending" && (
                        <Clock className="w-4 h-4" />
                      )}
                      {claim.status === "approved" && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {claim.status === "rejected" && (
                        <XCircle className="w-4 h-4" />
                      )}
                      {claim.status.toUpperCase()}
                    </div>
                  </div>

                  <p className="mt-4 text-slate-300">{claim.description}</p>

                  {claim.status === "approved" && (
                    <div className="mt-5 p-4 bg-green-900/30 border border-green-700 rounded-xl">
                      <p className="text-green-400 font-medium">
                        Your claim was approved! The owner will contact you
                        soon.
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Enlarged Image */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative">
            <Image
              src={enlargedImage}
              alt="Proof"
              width={1200}
              height={800}
              className="rounded-2xl object-contain max-w-full max-h-[90vh]"
              unoptimized
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-12 right-0 bg-slate-800/80 hover:bg-slate-700/80 text-white w-12 h-12 rounded-full flex items-center justify-center text-3xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

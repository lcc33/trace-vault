// src/app/claims/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Navbar } from "@/components";
import Link from "next/link";
import {
  Link2Icon,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

interface Claim {
  _id: string;
  reportId: string;
  reportTitle?: string;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  description: string;
  proofImage?: string;
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
    if (isLoaded && user) {
      fetchUserClaims();
    }
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
    action: "approve" | "reject"
  ) => {
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchUserClaims();
      }
    } catch (error) {
      console.error("Error updating claim:", error);
    }
  };

  const handleClaimAccept = async (claimId: string) => {
    try {
      const res = await fetch(`/api/claims/${claimId}/accept`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        fetchUserClaims(); // Refresh to show updated status
      } else {
        const data = await res.json();
        console.error("Error accepting claim:", data.error);
      }
    } catch (error) {
      console.error("Error accepting claim:", error);
    }
  };

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

      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">
          Claims Management
        </h1>

        {/* Tab Navigation - Responsive */}
        <div className="flex flex-col sm:flex-row border-b border-slate-700 mb-8">
          <button
            onClick={() => setActiveTab("received")}
            className={`px-6 py-3 font-medium text-center transition-colors relative ${
              activeTab === "received"
                ? "text-sky-400 border-b-2 border-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Claims on My Reports
            <span className="ml-2 text-sm bg-slate-700 px-2 py-0.5 rounded-full">
              {claimsReceived.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("made")}
            className={`px-6 py-3 font-medium text-center transition-colors relative ${
              activeTab === "made"
                ? "text-sky-400 border-b-2 border-sky-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            My Claims
            <span className="ml-2 text-sm bg-slate-700 px-2 py-0.5 rounded-full">
              {claimsMade.length}
            </span>
          </button>
        </div>

        {/* Claims Received */}
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
                  className="bg-slate-800/70 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-lg"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <Link
                        href={`/report/${claim.reportId}`}
                        className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold text-lg group"
                      >
                        <span>{claim.reportTitle || "View Report"}</span>
                        <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                      </Link>
                      <p className="text-sm text-slate-400 mt-1">
                        Claimed by:{" "}
                        <span className="font-medium text-slate-200">
                          {claim.claimantName}
                        </span>
                        {" • "} {claim.claimantEmail}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          claim.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                            : claim.status === "approved"
                            ? "bg-green-500/20 text-green-400 border border-green-500/50"
                            : "bg-red-500/20 text-red-400 border border-red-500/50"
                        }`}
                      >
                        {claim.status === "pending" && (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {claim.status === "approved" && (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        {claim.status === "rejected" && (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {claim.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    {claim.description}
                  </p>

                  {/* Proof Image */}
                  {claim.proofImage && (
                    <div className="mb-5">
                      <Image
                        src={claim.proofImage}
                        alt="Proof from claimant"
                        width={800}
                        height={600}
                        className="rounded-xl border border-slate-600 object-cover w-full max-h-96 cursor-pointer hover:opacity-90 transition-opacity"
                        unoptimized
                        onClick={() => setEnlargedImage(claim.proofImage!)}
                      />
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Tap to enlarge
                      </p>
                    </div>
                  )}

                  {/* Action Buttons - Responsive */}
                  {claim.status === "pending" && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <button
                        onClick={() => handleClaimAction(claim._id, "approve")}
                        className="flex-1 sm:flex-initial px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve Claim
                      </button>
                      <button
                        onClick={() => handleClaimAction(claim._id, "reject")}
                        className="flex-1 sm:flex-initial px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Claim
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Claims Made */}
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
                  className="bg-slate-800/70 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <Link
                        href={`/report/${claim.reportId}`}
                        className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold text-lg group"
                      >
                        <span>{claim.reportTitle || "View Report"}</span>
                        <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                      </Link>
                      <p className="text-sm text-slate-400 mt-2">
                        Submitted on{" "}
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
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
                      {claim.status}
                    </span>
                  </div>

                  <p className="mt-4 text-slate-300">{claim.description}</p>

                  {/* Accept Button for Approved Claims */}
                  {claim.status === "approved" && (
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleClaimAccept(claim._id)}
                        className="flex-1 sm:flex-initial px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept & Confirm
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <Image
              src={enlargedImage}
              alt="Enlarged proof"
              width={1200}
              height={800}
              className="rounded-2xl object-contain max-w-full max-h-[90vh] shadow-2xl"
              unoptimized
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-12 right-0 text-white bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur w-12 h-12 rounded-full flex items-center justify-center text-2xl font-light transition"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

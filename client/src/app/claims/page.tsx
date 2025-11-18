"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Navbar } from "@/components";
import Link from "next/link";
import { Link2Icon } from "lucide-react";

interface Claim {
  _id: string;
  reportId: string;
  reportTitle: string;
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
        fetchUserClaims(); // Refresh data
        // Show success toast
      }
    } catch (error) {
      console.error("Error updating claim:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 flex items-center justify-center gap-3 px-3">
        <div className="text-center">
          <p className="text-lg mb-4">Loading claims...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Claims Management</h1>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-700 mb-6">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "received"
                  ? "border-b-2 border-sky-500 text-sky-400"
                  : "text-slate-400"
              }`}
              onClick={() => setActiveTab("received")}
            >
              Claims on My Reports ({claimsReceived.length})
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "made"
                  ? "border-b-2 border-sky-500 text-sky-400"
                  : "text-slate-400"
              }`}
              onClick={() => setActiveTab("made")}
            >
              My Claims ({claimsMade.length})
            </button>
          </div>

          {/* Claims Received (User needs to take action) */}
          {activeTab === "received" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Claims on Your Reports
              </h2>
              {claimsReceived.length === 0 ? (
                <p className="text-slate-400">No claims on your reports yet.</p>
              ) : (
                claimsReceived.map((claim) => (
                  <div
                    key={claim._id}
                    className="bg-slate-800 rounded-lg p-4 mb-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          <Link
                            href={`/report/${claim.reportId}`}
                            className="inline-flex items-center gap-3 text-sky-400 font-semibold hover:underline underline-offset-4"
                            aria-label={`Open report ${claim.reportTitle}`}
                          >
                            <span className="text-sm">Report:</span>
                            <Link2Icon className="w-5 h-5 opacity-90" />
                          </Link>
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Claimant: {claim.claimantName} ({claim.claimantEmail})
                        </p>
                        <p className="mt-2">{claim.description}</p>
                        {claim.proofImage && (
                          <Image
                            src={claim.proofImage}
                            alt="Report image"
                            width={700}
                            height={300}
                            className="rounded-xl border border-slate-700 object-cover cursor-pointer max-w-[700px] max-h-[300px]"
                            unoptimized
                            onClick={(e) => {
                              e.stopPropagation();
                              setEnlargedImage(claim.proofImage!);
                            }}
                          />
                        )}
                      </div>
                      <div className="flex gap-2">
                        {claim.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleClaimAction(claim._id, "approve")
                              }
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleClaimAction(claim._id, "reject")
                              }
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            claim.status === "pending"
                              ? "bg-yellow-600"
                              : claim.status === "approved"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {claim.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Claims Made (User's own claims) */}
          {activeTab === "made" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Claims You have Made
              </h2>
              {claimsMade.length === 0 ? (
                <p className="text-slate-400">
                  You have not made any claims yet.
                </p>
              ) : (
                claimsMade.map((claim) => (
                  <div
                    key={claim._id}
                    className="bg-slate-800 rounded-lg p-4 mb-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">
                          <Link
                            href={`/report/${claim.reportId}`}
                            className="inline-flex items-center gap-3 text-sky-400 font-semibold hover:underline underline-offset-4"
                            aria-label={`Open report ${claim.reportTitle}`}
                          >
                            <span className="text-xl">Report</span>
                            <Link2Icon className="w-5 h-5 opacity-90" />
                          </Link>
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Status:{" "}
                          <span
                            className={
                              claim.status === "pending"
                                ? "text-yellow-400"
                                : claim.status === "approved"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {claim.status}
                          </span>
                        </p>
                        <p className="mt-2 text-sm">{claim.description}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-sm ${
                          claim.status === "pending"
                            ? "bg-yellow-600"
                            : claim.status === "approved"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={enlargedImage}
              alt="Enlarged report image"
              width={1200}
              height={800}
              className="rounded-lg object-contain max-w-full max-h-[90vh]"
              unoptimized
            />
            <button
              className="absolute -top-12 right-0 text-white text-lg bg-slate-800/50 hover:bg-slate-700/50 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              onClick={() => setEnlargedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

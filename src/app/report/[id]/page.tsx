"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import type { Report } from "@/app/home/types";

export default function ReportPage() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const { user, isSignedIn, isLoaded } = useUser();

  const isOwner = (report: Report) =>
    isSignedIn && report.reporterId === user?.id;
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [claimData, setClaimData] = useState<{
    image: File | null;
    description: string;
  }>({ image: null, description: "" });
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [popup, setPopup] = useState<{
    isVisible: boolean;
    message: string;
    isSuccess: boolean;
  }>({ isVisible: false, message: "", isSuccess: true });
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const showToast = useCallback(
    (message: string, isSuccess = true, duration = 3000) => {
      setPopup({ isVisible: true, message, isSuccess });
      setTimeout(() => setPopup((p) => ({ ...p, isVisible: false })), duration);
    },
    []
  );
  const defaultAvatar =
    "https://i.pinimg.com/736x/21/f6/fc/21f6fc4abd29ba736e36e540a787e7da.jpg";

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const baseUrl = window.location.origin;
        const res = await fetch(`${baseUrl}/api/reports/${id}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError("Report not found");
          } else {
            setError("Failed to load report");
          }
          return;
        }

        const reportData = await res.json();
        setReport(reportData);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchReport();
    }
  }, [id]);

  const openClaimModal = (id: string) => {
    setSelectedReportId(id);
    setShowModal(true);
    setClaimData({ image: null, description: "" });
  };

  const closeClaimModal = () => {
    setShowModal(false);
    setSelectedReportId(null);
  };

  const handleClaimSubmit = async () => {
    if (!claimData.description.trim())
      return showToast("Add a description", false);
    if (!claimData.image) return showToast("Upload proof image", false);

    setLoading(true);
    const formData = new FormData();
    formData.append("reportId", selectedReportId!);
    formData.append("description", claimData.description);
    formData.append("image", claimData.image);

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        closeClaimModal();
        showToast("Claim submitted!");
      } else {
        showToast(data.error || "Claim failed", false);
      }
    } catch {
      showToast("Network error", false);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Report deleted successfully");
        router.push("/home"); // Redirect to home after delete
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete", false);
      }
    } catch (err) {
      showToast("Network error", false);
    }
  };
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return notFound();
  }

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <div className="max-w-2xl mx-auto p-4">
          {/* Report Card */}
          <div className="bg-slate-800/40 border border-white/10 rounded-2xl shadow-lg p-6 mt-6">
            {/* User Header */}
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={report.user?.profilePic || defaultAvatar}
                alt={`${report.user?.name || "User"}'s profile`}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border border-white/10"
              />
              <div>
                <p className="font-semibold text-slate-100">
                  {report.user?.name || "Anonymous"}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(report.createdAt).toLocaleDateString()} •{" "}
                  {report.category}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className="text-slate-200 mb-4 leading-relaxed break-words whitespace-pre-wrap">
                {report.description}
              </p>
            </div>

            {/* Image */}
            {report.imageUrl && (
              <div className="mb-3 w-full aspect-video relative overflow-hidden rounded-xl border border-slate-700">
                <Image
                  src={report.imageUrl}
                  alt="Report image"
                  fill
                  className="object-cover w-full h-full cursor-pointer"
                  unoptimized
                  onClick={() => setEnlargedImage(report.imageUrl!)}
                  sizes="(max-width: 600px) 100vw, 600px"
                />
              </div>
            )}

            <div className="mt-4" onClick={(e) => e.stopPropagation()}>
              {!isOwner(report) && (
                <button
                  onClick={() => openClaimModal(report._id)}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Claim This Item
                </button>
              )}
            </div>
            {/* Claim Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-lg border border-slate-700 shadow-2xl">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Claim This Item
                  </h2>
                  <textarea
                    placeholder="Describe how this item belongs to you..."
                    value={claimData.description}
                    onChange={(e) =>
                      setClaimData({
                        ...claimData,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 min-h-32 resize-none mb-5"
                  />
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-3">
                      Proof of Ownership (Photo)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setClaimData({
                          ...claimData,
                          image: e.target.files?.[0] || null,
                        })
                      }
                      className="block w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
                    />
                    {claimData.image && (
                      <div className="mt-4">
                        <Image
                          src={URL.createObjectURL(claimData.image)}
                          alt="Proof"
                          width={400}
                          height={300}
                          className="rounded-2xl border border-slate-700 object-cover w-full max-h-64"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleClaimSubmit}
                      disabled={loading}
                      className="flex-1 py-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : null}
                      Submit Claim
                    </button>
                    <button
                      onClick={closeClaimModal}
                      className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Report ID */}
            <div className="text-xs text-slate-500 mt-4">
              Report ID: {report._id}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleBack}
              className="px-6 py-3 text-sm rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-2"
            >
              ← Back to Feed
            </button>

            <button
              onClick={handleShare}
              className="px-6 py-3 text-sm rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors flex items-center gap-2"
            >
              Share Report
            </button>

            {/* Delete Button — Only for Owner */}
            {isOwner(report) && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 text-sm rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2 ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete Report
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-red-500" />
              Confirm Delete
            </h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this report? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}

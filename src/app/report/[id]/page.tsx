"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Loader2, Trash2, AlertCircle, Share2, ArrowLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import type { Report } from "@/app/home/types";

// Loading skeleton for report detail
function ReportDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-slate-800/40 border border-white/10 rounded-2xl shadow-lg p-6 mt-6 animate-pulse">
          {/* User header skeleton */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-700 rounded w-32" />
              <div className="h-4 bg-slate-700 rounded w-24" />
            </div>
          </div>

          {/* Description skeleton */}
          <div className="mb-4 space-y-2">
            <div className="h-4 bg-slate-700 rounded w-full" />
            <div className="h-4 bg-slate-700 rounded w-5/6" />
            <div className="h-4 bg-slate-700 rounded w-4/6" />
          </div>

          {/* Image skeleton */}
          <div className="mb-3 w-full aspect-video bg-slate-700 rounded-xl" />

          {/* Button skeleton */}
          <div className="h-14 bg-slate-700 rounded-2xl w-full sm:w-40" />
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-3 mt-6">
          <div className="h-12 bg-slate-700 rounded-full w-32" />
          <div className="h-12 bg-slate-700 rounded-full w-32" />
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const { user, isSignedIn, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [claimData, setClaimData] = useState<{
    image: File | null;
    description: string;
  }>({ image: null, description: "" });

  const [popup, setPopup] = useState<{
    isVisible: boolean;
    message: string;
    isSuccess: boolean;
  }>({ isVisible: false, message: "", isSuccess: true });

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  const defaultAvatar =
    "https://i.pinimg.com/736x/21/f6/fc/21f6fc4abd29ba736e36e540a787e7da.jpg";

  const isOwner = (report: Report) =>
    isSignedIn && report.reporterId === user?.id;

  const showToast = useCallback(
    (message: string, isSuccess = true, duration = 3000) => {
      setPopup({ isVisible: true, message, isSuccess });
      setTimeout(() => setPopup((p) => ({ ...p, isVisible: false })), duration);
    },
    []
  );

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/reports/${id}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError("Report not found");
          } else if (res.status === 429) {
            const data = await res.json();
            const resetTime = data.reset 
              ? new Date(data.reset).toLocaleTimeString() 
              : 'later';
            setError(`Too many requests. Try again after ${resetTime}`);
          } else if (res.status === 503) {
            setError("Service temporarily unavailable. Retrying...");
            // Auto-retry after 5 seconds
            setTimeout(() => fetchReport(), 5000);
          } else {
            setError("Failed to load report");
          }
          return;
        }

        const reportData = await res.json();
        setReport(reportData);
        setError(null);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Network error. Check your connection.");
        // Auto-retry after 3 seconds
        setTimeout(() => fetchReport(), 3000);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [id]);

  const openClaimModal = (id: string) => {
    setSelectedReportId(id);
    setShowModal(true);
    setClaimData({ image: null, description: "" });
  };

  const closeClaimModal = () => {
    setShowModal(false);
    setSelectedReportId(null);
    setClaimData({ image: null, description: "" });
  };

  const handleClaimSubmit = async () => {
    if (!claimData.description.trim()) {
      return showToast("Please add a description", false);
    }
    if (claimData.description.length < 10) {
      return showToast("Description too short (min 10 characters)", false);
    }
    if (!claimData.image) {
      return showToast("Please upload proof image", false);
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("reportId", selectedReportId!);
    formData.append("description", claimData.description);
    formData.append("proofImage", claimData.image);

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        closeClaimModal();
        showToast("Claim submitted successfully! The reporter will review it.");
      } else {
        if (res.status === 429) {
          const resetTime = data.reset 
            ? new Date(data.reset).toLocaleTimeString() 
            : 'later';
          showToast(`Daily limit reached (${data.limit || 3} claims/day). Try again after ${resetTime}`, false, 5000);
        } else if (res.status === 413) {
          showToast("Image too large. Please use a smaller image.", false);
        } else {
          showToast(data.error || "Failed to submit claim", false);
        }
      }
    } catch (err) {
      console.error("Claim submission error:", err);
      showToast("Network error. Check your connection.", false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard!");
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Report deleted successfully");
        setTimeout(() => router.push("/home"), 1000);
      } else {
        const data = await res.json();
        if (res.status === 429) {
          showToast("Too many requests. Please wait a moment.", false);
        } else if (res.status === 409) {
          showToast("Cannot delete report with approved claims. Mark as closed instead.", false, 5000);
        } else {
          showToast(data.error || "Failed to delete report", false);
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Network error. Check your connection.", false);
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Show skeleton while loading
  if (loading) {
    return <ReportDetailSkeleton />;
  }

  // Show 404 if error is "not found"
  if (error === "Report not found" || (!report && !loading)) {
    return notFound();
  }

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <div className="max-w-2xl mx-auto p-4">
          {/* Error Banner */}
          {error && error !== "Report not found" && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-2xl mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">{error}</p>
                {error.includes("temporarily unavailable") && (
                  <p className="mt-1 text-xs text-red-300">
                    Automatically retrying...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Report Card */}
          {report && (
            <div className="bg-slate-800/40 border border-white/10 rounded-2xl shadow-lg p-6 mt-6">
              {/* User Header */}
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={report.user?.profilePic || defaultAvatar}
                  alt={`${report.user?.name || "User"}'s profile`}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                  priority
                />
                <div>
                  <p className="font-semibold text-slate-100">
                    {report.user?.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(report.createdAt).toLocaleDateString()} •{" "}
                    <span className="capitalize">{report.category}</span>
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>

              {/* Image */}
              {report.imageUrl && (
                <div className="mb-4 w-full aspect-video relative overflow-hidden rounded-xl border border-slate-700">
                  {imageLoading && (
                    <div className="absolute inset-0 bg-slate-700 animate-pulse" />
                  )}
                  <Image
                    src={report.imageUrl}
                    alt="Report image"
                    fill
                    className={`object-cover cursor-pointer hover:opacity-90 transition ${
                      imageLoading ? "opacity-0" : "opacity-100"
                    }`}
                    unoptimized
                    onClick={() => setEnlargedImage(report.imageUrl!)}
                    sizes="(max-width: 600px) 100vw, 600px"
                    onLoadingComplete={() => setImageLoading(false)}
                  />
                </div>
              )}

              {/* Claim Button */}
              <div className="mt-4">
                {!isOwner(report) && report.status !== "claimed" && (
                  <button
                    onClick={() => openClaimModal(report._id)}
                    className="w-full sm:w-auto px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Claim This Item
                  </button>
                )}
                {report.status === "claimed" && (
                  <div className="text-center py-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700 text-green-400 rounded-full text-sm font-medium">
                      Item Already Claimed
                    </span>
                  </div>
                )}
              </div>

              {/* Report ID */}
              <div className="text-xs text-slate-500 mt-4">
                Report ID: {report._id}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {report && (
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={handleBack}
                className="px-6 py-3 text-sm rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleShare}
                className="px-6 py-3 text-sm rounded-full bg-sky-600 hover:bg-sky-700 text-white transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              {/* Delete Button — Only for Owner */}
              {isOwner(report) && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={submitting}
                  className="px-6 py-3 text-sm rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-2 ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {popup.isVisible && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl border ${
              popup.isSuccess
                ? "bg-green-900/90 border-green-700 text-green-100"
                : "bg-red-900/90 border-red-700 text-red-100"
            }`}
          >
            {popup.message}
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-lg border border-slate-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              Claim This Item
            </h2>
            <textarea
              placeholder="Describe how this item belongs to you... (min 10 characters)"
              value={claimData.description}
              onChange={(e) =>
                setClaimData({
                  ...claimData,
                  description: e.target.value,
                })
              }
              maxLength={280}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 min-h-32 resize-none mb-2"
            />
            <div className="text-xs text-slate-500 mb-5 text-right">
              {claimData.description.length}/280
            </div>

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
                    unoptimized
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClaimSubmit}
                disabled={submitting}
                className="flex-1 py-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {submitting ? "Submitting..." : "Submit Claim"}
              </button>
              <button
                onClick={closeClaimModal}
                disabled={submitting}
                className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold rounded-2xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !submitting && setShowDeleteModal(false)}
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
                disabled={submitting}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Image Modal */}
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
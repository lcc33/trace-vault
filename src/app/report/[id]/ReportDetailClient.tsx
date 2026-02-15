"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Trash2, AlertCircle, Share2, ArrowLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import type { Report } from "@/app/home/types";

export default function ReportDetailClient({
  initialReport,
}: {
  initialReport: Report;
}) {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const [report] = useState<Report>(initialReport);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [claimData, setClaimData] = useState<{
    image: File | null;
    description: string;
  }>({
    image: null,
    description: "",
  });
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    isSuccess: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  const defaultAvatar =
    "https://i.pinimg.com/736x/21/f6/fc/21f6fc4abd29ba736e36e540a787e7da.jpg";
  const isOwner = isSignedIn && report.reporterId === user?.id;

  const showToast = useCallback(
    (message: string, isSuccess = true, duration = 3000) => {
      setPopup({ isVisible: true, message, isSuccess });
      setTimeout(() => setPopup((p) => ({ ...p, isVisible: false })), duration);
    },
    [],
  );

  const handleClaimSubmit = async () => {
    if (!claimData.description.trim() || claimData.description.length < 10) {
      return showToast("Description too short (min 10 characters)", false);
    }
    if (!claimData.image) return showToast("Please upload proof image", false);

    setSubmitting(true);
    const formData = new FormData();
    formData.append("reportId", report._id);
    formData.append("description", claimData.description);
    formData.append("proofImage", claimData.image);

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        showToast("Claim submitted successfully!");
      } else {
        showToast(data.error || "Failed to submit claim", false);
      }
    } catch (err) {
      showToast("Network error. Check your connection.", false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${report._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Report deleted successfully");
        setTimeout(() => router.push("/home"), 1000);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete", false);
      }
    } catch (err) {
      showToast("Network error", false);
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-slate-800/40 border border-white/10 rounded-2xl shadow-lg p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={report.user?.profilePic || defaultAvatar}
              alt="User"
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
                <span className="capitalize">{report.category}</span>
              </p>
            </div>
          </div>

          <p className="text-slate-200 leading-relaxed mb-4 whitespace-pre-wrap">
            {report.description}
          </p>

          {report.imageUrl && (
            <div className="mb-4 w-full aspect-video relative overflow-hidden rounded-xl border border-slate-700">
              {imageLoading && (
                <div className="absolute inset-0 bg-slate-700 animate-pulse" />
              )}
              <Image
                src={report.imageUrl}
                alt="Item"
                fill
                className="object-cover cursor-pointer hover:opacity-90"
                unoptimized
                onClick={() => setEnlargedImage(report.imageUrl!)}
                onLoadingComplete={() => setImageLoading(false)}
              />
            </div>
          )}

          {!isOwner && report.status !== "claimed" && (
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl transition-all shadow-lg"
            >
              Claim This Item
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 text-sm rounded-full bg-slate-700 text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast("Link copied!");
            }}
            className="px-6 py-3 text-sm rounded-full bg-sky-600 text-white flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          {isOwner && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 text-sm rounded-full bg-red-600 text-white flex items-center gap-2 ml-auto"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
        </div>
      </div>

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
                setClaimData({ ...claimData, description: e.target.value })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white min-h-32 mb-4"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setClaimData({
                  ...claimData,
                  image: e.target.files?.[0] || null,
                })
              }
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-sky-600 file:text-white"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClaimSubmit}
                disabled={submitting}
                className="flex-1 py-4 bg-sky-600 text-white font-bold rounded-2xl flex justify-center gap-2"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}{" "}
                Submit
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 bg-slate-700 text-white font-bold rounded-2xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Trash2 className="text-red-500" /> Delete Report?
            </h3>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-slate-700 text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <Image
            src={enlargedImage}
            alt="Enlarged"
            width={1200}
            height={800}
            className="object-contain max-h-[90vh]"
            unoptimized
          />
        </div>
      )}

      {popup.isVisible && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl border ${popup.isSuccess ? "bg-green-900 border-green-700" : "bg-red-900 border-red-700"}`}
          >
            {popup.message}
          </div>
        </div>
      )}
    </div>
  );
}

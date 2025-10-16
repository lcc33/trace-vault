"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { notFound } from "next/navigation";

interface Report {
  _id: string;
  description: string;
  category: string;
  contact: string;
  imageUrl?: string;
  createdAt: string;
  user?: {
    name?: string;
    email?: string;
    profilePic?: string;
  };
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const { data: currentUser } = useSession();

  // Claim modal state
  const [showModal, setShowModal] = useState(false);
  const [claimData, setClaimData] = useState<{ image: File | null; description: string }>({
    image: null,
    description: "",
  });

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleBack = () => {
    router.back();
  };

  const isOwner =
    currentUser?.user?.email && report?.user?.email === currentUser.user.email;

  const openClaimModal = () => {
    setShowModal(true);
    setClaimData({ image: null, description: "" });
  };

  const closeClaimModal = () => {
    setShowModal(false);
    setClaimData({ image: null, description: "" });
  };

  const handleClaimSubmit = async () => {
    if (!claimData.description.trim()) {
      alert("Please provide a claim description.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("reportId", id);
      formData.append("description", claimData.description);
      if (claimData.image) formData.append("image", claimData.image);

      const res = await fetch("/api/claims", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        closeClaimModal();
        alert("Claim submitted successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit claim");
      }
    } catch (err) {
      console.error("Error submitting claim:", err);
      alert("Error submitting claim");
    }
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
              <p className="text-slate-200 leading-relaxed">
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

            {/* Report ID */}
            <div className="text-xs text-slate-500 mt-4">
              Report ID: {report._id}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm rounded-full                                            bg-slate                                                                                                                                                                                                                                                                                                                            -700 hover:bg-slate-600 text-white transition-colors"
            >
              ← Back to Feed
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 text-sm rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
            >
              Share Report
            </button>
            {!isOwner && (
              <button
                onClick={openClaimModal}
                className="px-4 py-2 text-sm rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
              >
                Claim Item
              </button>
            )}
          </div>
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

      {/* Claim Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4">Claim Item</h2>

            <textarea
              placeholder="Describe how you lost this item and provide any identifying details..."
              value={claimData.description}
              onChange={(e) => setClaimData({ ...claimData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 mb-3 focus:border-sky-500 outline-none resize-none min-h-[100px]"
              required
            />

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Upload proof image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  setClaimData({ ...claimData, image: file || null });
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 outline-none"
              />
              {claimData.image && (
                <div className="mt-2 flex justify-center">
                  <Image
                    src={URL.createObjectURL(claimData.image)}
                    alt="Preview"
                    width={150}
                    height={100}
                    className="max-h-32 rounded-lg border border-slate-700 object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeClaimModal}
                className="px-4 py-2 text-sm rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClaimSubmit}
                className="px-4 py-2 text-sm rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
              >
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
  );
}

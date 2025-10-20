"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

interface Report {
  _id: string;
  description: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
  user?: {
    name?: string;
    email?: string;
    profilePic?: string;
  };
}

export default function ReportsFeed({
  initialReports,
}: {
  initialReports: Report[];
}) {
  // Ensure initialReports is always an array
  const [reports, setReports] = useState(
    Array.isArray(initialReports) ? initialReports : []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const { data: currentUser } = useSession();
  const router = useRouter();

  const defaultAvatar =
    "https://i.pinimg.com/736x/21/f6/fc/21f6fc4abd29ba736e36e540a787e7da.jpg";

  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    isSuccess: true,
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [claimData, setClaimData] = useState<{
    image: File | null;
    description: string;
  }>({
    image: null,
    description: "",
  });
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // FIXED: Added null checks for report properties
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesCategory =
        filterCategory === "all" || report.category === filterCategory;
      
      // Added null checks for description
      const matchesSearch = report.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ?? false;
      
      return matchesCategory && matchesSearch;
    });
  }, [reports, searchQuery, filterCategory]);

  // Enhanced error display function
  const showError = (message: string, duration = 4000) => {
    setPopup({
      isVisible: true,
      message,
      isSuccess: false,
    });
    setTimeout(() => setPopup((p) => ({ ...p, isVisible: false })), duration);
  };

  const showSuccess = (message: string, duration = 3000) => {
    setPopup({
      isVisible: true,
      message,
      isSuccess: true,
    });
    setTimeout(() => setPopup((p) => ({ ...p, isVisible: false })), duration);
  };

  // Add this function to handle post clicks
  const handlePostClick = (reportId: string) => {
    router.push(`/report/${reportId}`);
  };

  const handleShare = (reportId: string) => {
    const url = `${window.location.origin}/report/${reportId}`;
    navigator.clipboard.writeText(url);
    showSuccess("Post link copied!");
  };

  const handleDelete = async (reportId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report? This action cannot be undone."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setReports((prev) => prev.filter((r) => r._id !== reportId));
        showSuccess("Report deleted successfully!");
      } else {
        const errorMessage = data.error || data.message || "Failed to delete report";
        showError(`Delete failed: ${errorMessage}`);
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      showError("Network error: Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced claim submission with better error handling
  const handleClaimSubmit = async () => {
    if (!claimData.description.trim()) {
      showError("Please provide a claim description");
      return;
    }

    if (!selectedReportId) {
      showError("No report selected for claim");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("reportId", selectedReportId);
      formData.append("description", claimData.description);

      if (claimData.image) {
        formData.append("image", claimData.image);
      }

      const res = await fetch("/api/claims", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(false);
        setClaimData({ image: null, description: "" });
        setSelectedReportId(null);
        showSuccess("Claim submitted successfully!");
      } else {
        const errorMessage = data.error || data.message || "Failed to submit claim";
        
        // Handle specific error cases
        if (res.status === 400) {
          showError(`Invalid input: ${errorMessage}`);
        } else if (res.status === 401) {
          showError("Please sign in to submit claims");
        } else if (res.status === 404) {
          showError("Report not found");
        } else if (res.status === 413) {
          showError("Image file too large");
        } else if (res.status === 502 || res.status === 504) {
          showError("Upload service unavailable. Please try again.");
        } else if (res.status === 503) {
          showError("Service temporarily unavailable. Please try again.");
        } else {
          showError(`Submission failed: ${errorMessage}`);
        }
      }
    } catch (error: any) {
      console.error("Claim submission error:", error);
      
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        showError("Network error: Unable to connect to server");
      } else {
        showError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to open claim modal with report ID
  const openClaimModal = (reportId: string) => {
    setSelectedReportId(reportId);
    setShowModal(true);
    setClaimData({ image: null, description: "" });
  };

  // Function to close modal and reset state
  const closeClaimModal = () => {
    setShowModal(false);
    setSelectedReportId(null);
    setClaimData({ image: null, description: "" });
  };

  return (
    <>
      {popup.isVisible && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-sm font-semibold shadow-lg z-50 transition-all duration-300 ${
            popup.isSuccess 
              ? "bg-green-500 text-white" 
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {popup.isSuccess ? "✅" : "❌"}
            {popup.message}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
            <span className="text-slate-200">Processing...</span>
          </div>
        </div>
      )}

      {/* Search + filter */}
      <section className="border-b border-slate-700 p-4 flex gap-3 sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm focus:border-sky-500 outline-none text-white placeholder-slate-400"
          disabled={loading}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-full px-3 py-2 text-sm focus:border-sky-500 outline-none text-white"
          disabled={loading}
        >
          <option value="all">All</option>
          <option value="phone">📱 Phone</option>
          <option value="id">🆔 ID Card</option>
          <option value="bag">🎒 Bag</option>
          <option value="wallet">💰 Wallet</option>
          <option value="other">📦 Other</option>
        </select>
      </section>

      {/* Reports Feed */}
      <section>
        {filteredReports.length === 0 ? (
          <p className="text-center text-slate-400 py-12">
            {reports.length === 0 ? "No reports yet" : "No reports match your search"}
          </p>
        ) : (
          filteredReports.map((report) => {
            // FIXED: Added null checks for user properties
            const isOwner =
              currentUser?.user?.email &&
              report.user?.email === currentUser.user.email;

            return (
              <div
                key={report._id}
                className="border-b border-slate-700 p-4 hover:bg-white/5 relative cursor-pointer transition-colors"
                onClick={() => !loading && handlePostClick(report._id)}
              >
                {/* User Header */}
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src={report.user?.profilePic || defaultAvatar}
                    alt={`${report.user?.name || "User"}'s profile`}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border border-slate-600"
                  />
                  <div>
                    <p className="font-bold text-slate-100">
                      {report.user?.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()} •{" "}
                      {report.category}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm mb-2 text-slate-200">{report.description}</p>

                {/* Image - Fixed small size with click to enlarge */}
                {report.imageUrl && (
                  <div className="mb-3">
                    <Image
                      src={report.imageUrl}
                      alt="Report image"
                      width={700}
                      height={300}
                      className="rounded-xl border border-slate-700 object-cover cursor-pointer max-w-[700px] max-h-[300px] hover:opacity-90 transition-opacity"
                      unoptimized
                      onClick={(e) => {
                        e.stopPropagation();
                        setEnlargedImage(report.imageUrl!);
                      }}
                    />
                  </div>
                )}

                {/* Actions */}
                <div
                  className="flex items-center justify-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!isOwner && (
                    <button
                      onClick={() => openClaimModal(report._id)}
                      disabled={loading}
                      className="px-7 py-2 text-sm font-medium rounded-full flex justify-end bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "Processing..." : "Claim"}
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(
                          activeMenu === report._id ? null : report._id
                        );
                      }}
                      disabled={loading}
                      className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50 transition-colors"
                      aria-label="open menu"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeMenu === report._id && (
                      <div className="absolute left-7 bottom-12 mt-2 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20">
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(report._id);
                            }}
                            disabled={loading}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50 transition-colors text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(report._id);
                          }}
                          disabled={loading}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50 transition-colors"
                        >
                          Share Post
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Claim Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-white">Claim Item</h2>

            <textarea
              placeholder="Describe how you lost this item and provide any identifying details..."
              value={claimData.description}
              onChange={(e) =>
                setClaimData({ ...claimData, description: e.target.value })
              }
              disabled={loading}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 mb-3 focus:border-sky-500 outline-none resize-none min-h-[100px] disabled:opacity-50"
              required
            />

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">
                Upload proof image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  setClaimData({ ...claimData, image: file || null });
                }}
                disabled={loading}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 outline-none disabled:opacity-50"
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
                disabled={loading}
                className="px-4 py-2 text-sm rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClaimSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                )}
                {loading ? "Submitting..." : "Submit Claim"}
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
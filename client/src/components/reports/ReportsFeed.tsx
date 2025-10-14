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
  contact: string;
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
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null); // ADD THIS
  const [claimData, setClaimData] = useState<{ image: File | null; description: string }>({ 
    image: null, 
    description: "" 
  });
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesCategory =
        filterCategory === "all" || report.category === filterCategory;
      const matchesSearch =
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.contact.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [reports, searchQuery, filterCategory]);

  // Add this function to handle post clicks
  const handlePostClick = (reportId: string) => {
    router.push(`/report/${reportId}`);
  };

  const handleShare = (reportId: string) => {
    const url = `${window.location.origin}/report/${reportId}`;
    navigator.clipboard.writeText(url);
    setPopup({
      isVisible: true,
      message: "Post link copied!",
      isSuccess: true,
    });
    setTimeout(() => setPopup({ ...popup, isVisible: false }), 2000);
  };

  const handleDelete = async (reportId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this report? This action cannot be undone.");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/reports/${reportId}`, { // FIXED: Use the correct endpoint
        method: "DELETE",
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r._id !== reportId));
        setPopup({ isVisible: true, message: "Post deleted!", isSuccess: true });
      } else {
        const data = await res.json();
        setPopup({ isVisible: true, message: data.error || "Failed to delete", isSuccess: false });
      }
    } catch (err) {
      setPopup({ isVisible: true, message: "Failed to delete", isSuccess: false });
    }
    setTimeout(() => setPopup((p) => ({ ...p, isVisible: false })), 2000);
  };

  // FIXED: Proper claim submission with file upload
  const handleClaimSubmit = async () => {
    if (!claimData.description.trim()) {
      alert("Please provide a claim description.");
      return;
    }

    if (!selectedReportId) {
      alert("No report selected for claim.");
      return;
    }

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

      if (res.ok) {
        setShowModal(false);
        setClaimData({ image: null, description: "" });
        setSelectedReportId(null);
        setPopup({ 
          isVisible: true, 
          message: "Claim submitted successfully!", 
          isSuccess: true 
        });
      } else {
        const errorData = await res.json();
        setPopup({ 
          isVisible: true, 
          message: errorData.error || "Failed to submit claim", 
          isSuccess: false 
        });
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
      setPopup({ 
        isVisible: true, 
        message: "Error submitting claim", 
        isSuccess: false 
      });
    } finally {
      setTimeout(() => setPopup(p => ({ ...p, isVisible: false })), 2000);
    }
  };

  // ADD THIS: Function to open claim modal with report ID
  const openClaimModal = (reportId: string) => {
    setSelectedReportId(reportId);
    setShowModal(true);
    setClaimData({ image: null, description: "" }); // Reset form
  };

  // ADD THIS: Function to close modal and reset state
  const closeClaimModal = () => {
    setShowModal(false);
    setSelectedReportId(null);
    setClaimData({ image: null, description: "" });
  };

  return (
    <>
      {popup.isVisible && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg ${
            popup.isSuccess ? "bg-green-500" : "bg-red-600"
          }`}
        >
          {popup.message}
        </div>
      )}

      {/* Search + filter */}
      <section className="border-b border-slate-700 p-4 flex gap-3 sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm focus:border-sky-500 outline-none"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-full px-3 py-2 text-sm focus:border-sky-500 outline-none"
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
          <p className="text-center text-slate-400 py-12">No reports found.</p>
        ) : (
          filteredReports.map((report) => {
            const isOwner =
              currentUser?.user?.email &&
              report.user?.email === currentUser.user.email;

            return (
              <div
                key={report._id}
                className="border-b border-slate-700 p-4 hover:bg-white/5 relative cursor-pointer"
                onClick={() => handlePostClick(report._id)}
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
                <p className="text-sm mb-2">{report.description}</p>

                {/* Image - Fixed small size with click to enlarge */}
                {report.imageUrl && (
                  <div className="mb-3">
                    <Image
                      src={report.imageUrl}
                      alt="Report image"
                      width={700}
                      height={300}
                      className="rounded-xl border border-slate-700 object-cover cursor-pointer max-w-[700px] max-h-[300px]"
                      unoptimized
                      onClick={(e) => {
                        e.stopPropagation();
                        setEnlargedImage(report.imageUrl!);
                      }}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {!isOwner && (
                    <button
                      onClick={() => openClaimModal(report._id)} // FIXED: Use openClaimModal
                      className="px-4 py-1.5 text-sm font-medium rounded-full flex justify-end bg-sky-500 hover:bg-sky-600 text-white"
                    >
                      Claim
                    </button>
                  )}

                  {isOwner && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(
                            activeMenu === report._id ? null : report._id
                          );
                        }}
                        className="p-2 rounded-full hover:bg-white/10"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenu === report._id && (
                        <div className="absolute left-7 bottom-12 mt-2 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(report._id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-white/10"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(report._id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-white/10"
                          >
                            Share Post
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
            <h2 className="text-lg font-semibold mb-4">Claim Item</h2>

            <textarea
              placeholder="Describe how you lost this item and provide any identifying details..."
              value={claimData.description}
              onChange={(e) =>
                setClaimData({ ...claimData, description: e.target.value })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 mb-3 focus:border-sky-500 outline-none resize-none min-h-[100px]"
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
                onClick={closeClaimModal} // FIXED: Use closeClaimModal
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
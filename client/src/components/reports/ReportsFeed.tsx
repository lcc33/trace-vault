// src/components/reports/ReportsFeed.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { MoreVertical, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatRelativeTime } from "@/constants/dateFormatter";
import type { Report, Pagination } from "@/app/home/page";

export default function ReportsFeed({
  initialReports = [],
  initialPagination,
}: {
  initialReports?: Report[];
  initialPagination?: Pagination;
}) {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  const [reports, setReports] = useState<Report[]>(
    Array.isArray(initialReports) ? initialReports : []
  );
  const [pagination, setPagination] = useState<Pagination>(
    initialPagination ?? {
      page: 1,
      limit: 10,
      total: 0,
      hasNext: false,
      totalPages: 0,
    }
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [popup, setPopup] = useState<{
    isVisible: boolean;
    message: string;
    isSuccess: boolean;
  }>({ isVisible: false, message: "", isSuccess: true });

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [claimData, setClaimData] = useState<{
    image: File | null;
    description: string;
  }>({ image: null, description: "" });
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const showToast = useCallback(
    (message: string, isSuccess = true, duration = 3000) => {
      setPopup({ isVisible: true, message, isSuccess });
      setTimeout(() => setPopup(p => ({ ...p, isVisible: false })), duration);
    },
    []
  );

  const fetchReports = useCallback(
    async (page: number = 1, append = false) => {
      const isLoadMore = page > 1;
      if (isLoadMore) setFetchingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          ...(filterCategory !== "all" && { category: filterCategory }),
          ...(searchQuery && { q: searchQuery }),
        });

        const res = await fetch(`/api/reports?${params}`);
        const data = await res.json();

        if (res.ok) {
          const newReports: Report[] = data.reports || [];
          setReports(prev => append ? [...prev, ...newReports] : newReports);
          setPagination(data.pagination);
        } else {
          showToast(data.error || "Failed to load reports", false);
        }
      } catch (err) {
        showToast("Network error", false);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [filterCategory, searchQuery, showToast]
  );

  useEffect(() => {
    if (isLoaded) fetchReports(1);
  }, [isLoaded, fetchReports]);

  // Listen for external refresh requests (e.g. after creating a report)
  useEffect(() => {
    const handleRefresh = () => fetchReports(1);
    window.addEventListener("reports:refresh", handleRefresh);
    return () => window.removeEventListener("reports:refresh", handleRefresh);
  }, [fetchReports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesCategory = filterCategory === "all" || report.category === filterCategory;
      const matchesSearch = report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      return matchesCategory && matchesSearch;
    });
  }, [reports, searchQuery, filterCategory]);

  // FIXED: Correct DELETE call + proper ownership check
  const handleDelete = async (reportId: string) => {
    if (!confirm("Delete this report? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setReports(prev => prev.filter(r => r._id !== reportId));
        showToast("Report deleted");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to delete", false);
      }
    } catch (err) {
      showToast("Network error", false);
    }
  };

  const handleShare = (reportId: string) => {
    const url = `${window.location.origin}/report/${reportId}`;
    navigator.clipboard.writeText(url);
    showToast("Link copied!");
  };

  const handlePostClick = (reportId: string) => {
    router.push(`/report/${reportId}`);
  };

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
    if (!claimData.description.trim()) return showToast("Add a description", false);
    if (!claimData.image) return showToast("Upload proof image", false);

    setLoading(true);
    const formData = new FormData();
    formData.append("reportId", selectedReportId!);
    formData.append("description", claimData.description);
    formData.append("image", claimData.image);

    try {
      const res = await fetch("/api/claims", { method: "POST", body: formData });
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

  const loadMore = () => {
    if (pagination.hasNext && !fetchingMore) {
      fetchReports(pagination.page + 1, true);
    }
  };

  return (
    <>
      {/* Toast */}
      {popup.isVisible && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-sm font-semibold shadow-lg z-50 transition-all ${popup.isSuccess ? "bg-green-500" : "bg-red-500"} text-white`}>
          {popup.message}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="animate-spin h-6 w-6 text-sky-500" />
            <span>Processing...</span>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <section className="border-b border-slate-700 p-4 flex gap-3 sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm focus:border-sky-500 outline-none text-white placeholder-slate-400"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-full px-3 py-2 text-sm focus:border-sky-500 outline-none text-white"
        >
          <option value="all">All</option>
          <option value="electronics">Phone</option>
          <option value="documents">ID Card</option>
          <option value="bags">Bag</option>
          <option value="accessories">Wallet</option>
          <option value="other">Other</option>
        </select>
      </section>

      {/* Feed */}
      <section>
        {filteredReports.length === 0 ? (
          <p className="text-center text-slate-400 py-12">
            {reports.length === 0 ? "No reports yet" : "No matches found"}
          </p>
        ) : (
          <>
            {filteredReports.map((report) => {
              // FIXED: Compare with actual reporterId from DB
              const isOwner = isSignedIn && report.reporterId && user?.id && 
                // You must store the TraceVault user _id in report.reporterId
                // If you're using string _id → compare with your users collection lookup
                // For now: assume reporterId is the Clerk ID (if you stored it directly)
                report.reporterId === user?.id;

              return (
                <div
                  key={report._id}
                  className="border-b border-slate-700 p-4 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => handlePostClick(report._id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={report.user?.profilePic || "/default-avatar.png"}
                        alt="User"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border border-slate-600"
                      />
                      <div>
                        <p className="font-bold text-slate-100">
                          {report.user?.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatRelativeTime(report.createdAt)} • {report.category}
                        </p>
                      </div>
                    </div>

                    {/* Owner Menu */}
                    {isOwner && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === report._id ? null : report._id);
                          }}
                          className="p-2 rounded-full hover:bg-white/10"
                        >
                          <MoreVertical size={18} className="text-slate-400" />
                        </button>

                        {activeMenu === report._id && (
                          <div className="absolute right-0 top-8 mt-2 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(report._id);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-red-900/20 text-red-400"
                            >
                              Delete
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(report._id);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 text-slate-200"
                            >
                              Share
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description & Image */}
                  <p className="text-sm mb-3 text-slate-200">{report.description}</p>
                  {report.imageUrl && (
                    <div className="mb-3">
                      <Image
                        src={report.imageUrl}
                        alt="Report"
                        width={700}
                        height={300}
                        className="rounded-xl border border-slate-700 object-cover cursor-pointer max-h-64 hover:opacity-90"
                        unoptimized
                        onClick={(e) => {
                          e.stopPropagation();
                          setEnlargedImage(report.imageUrl!);
                        }}
                      />
                    </div>
                  )}

                  {/* Claim Button */}
                  <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    {!isOwner && (
                      <button
                        onClick={() => openClaimModal(report._id)}
                        className="px-6 py-2 text-sm font-medium rounded-full bg-sky-500 hover:bg-sky-600 text-white"
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Load More */}
            {pagination.hasNext && (
              <div className="p-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={fetchingMore}
                  className="text-sky-500 hover:text-sky-400 text-sm font-medium disabled:opacity-50"
                >
                  {fetchingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-white">Claim Item</h2>
            <textarea
              placeholder="Describe how you lost this..."
              value={claimData.description}
              onChange={(e) => setClaimData({ ...claimData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 mb-3 focus:border-sky-500 outline-none resize-none min-h-[100px]"
            />
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Proof Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setClaimData({ ...claimData, image: e.target.files?.[0] || null })}
                className="w-full"
              />
              {claimData.image && (
                <Image
                  src={URL.createObjectURL(claimData.image)}
                  alt="Preview"
                  width={150}
                  height={100}
                  className="mt-2 max-h-32 rounded-lg border object-cover"
                />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeClaimModal} className="px-4 py-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white">
                Cancel
              </button>
              <button
                onClick={handleClaimSubmit}
                disabled={loading}
                className="px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin h-4 w-4" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {enlargedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setEnlargedImage(null)}>
          <div className="relative">
            <Image
              src={enlargedImage}
              alt="Enlarged"
              width={1200}
              height={800}
              className="rounded-lg object-contain max-w-full max-h-[90vh]"
              unoptimized
            />
            <button
              className="absolute -top-12 right-0 text-white text-2xl bg-slate-800/50 hover:bg-slate-700/50 w-10 h-10 rounded-full"
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
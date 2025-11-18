// src/components/reports/ReportsFeed.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { MoreVertical, Loader2, Search, Filter } from "lucide-react";
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
      setTimeout(() => setPopup((p) => ({ ...p, isVisible: false })), duration);
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
          setReports((prev) =>
            append ? [...prev, ...newReports] : newReports
          );
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

  useEffect(() => {
    const handleRefresh = () => fetchReports(1);
    window.addEventListener("reports:refresh", handleRefresh);
    return () => window.removeEventListener("reports:refresh", handleRefresh);
  }, [fetchReports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesCategory =
        filterCategory === "all" || report.category === filterCategory;
      const matchesSearch =
        report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false;
      return matchesCategory && matchesSearch;
    });
  }, [reports, searchQuery, filterCategory]);

  const handleDelete = async (reportId: string) => {
    if (!confirm("Delete this report? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r._id !== reportId));
        showToast("Report deleted");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to delete", false);
      }
    } catch {
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

  const loadMore = () => {
    if (pagination.hasNext && !fetchingMore) {
      fetchReports(pagination.page + 1, true);
    }
  };

  const isOwner = (report: Report) =>
    isSignedIn && report.reporterId === user?.id;

  return (
    <>
      {/* Toast */}
      {popup.isVisible && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-bold shadow-2xl z-50 transition-all animate-pulse ${
            popup.isSuccess ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          {popup.message}
        </div>
      )}

      {/* Fullscreen Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin h-12 w-12 text-sky-500" />
            <p className="text-lg text-slate-300">Loading reports...</p>
          </div>
        </div>
      )}

      {/* Search & Filter - Fully Responsive */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/70 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-12 pr-10 py-3 bg-slate-800/70 border border-slate-700 rounded-2xl text-white appearance-none focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition min-w-[140px]"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Phone</option>
                <option value="documents">ID Card</option>
                <option value="bags">Bag</option>
                <option value="accessories">Wallet</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-6xl mx-auto">
        {filteredReports.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="bg-slate-800/50 rounded-3xl p-12 border-2 border-dashed border-slate-700">
              <p className="text-2xl text-slate-400 mb-2">
                {reports.length === 0
                  ? "No reports yet"
                  : "No reports match your search"}
              </p>
              {reports.length === 0 && (
                <p className="text-slate-500">
                  Be the first to post something!
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredReports.map((report) => (
              <article
                key={report._id}
                className="p-5 hover:bg-slate-800/50 transition-all cursor-pointer"
                onClick={() => handlePostClick(report._id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Image
                      src={report.user?.profilePic || "/default-avatar.png"}
                      alt="User"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">
                        {report.user?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatRelativeTime(report.createdAt)} •{" "}
                        <span className="capitalize">{report.category}</span>
                      </p>
                    </div>
                  </div>

                  {/* Owner Menu */}
                  {isOwner(report) && (
                    <div
                      className="relative flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === report._id ? null : report._id
                          )
                        }
                        className="p-2 rounded-full hover:bg-slate-700 transition"
                      >
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                      </button>
                      {activeMenu === report._id && (
                        <div className="absolute right-0 top-10 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-20">
                          <button
                            onClick={() => {
                              handleDelete(report._id);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/30 transition"
                          >
                            Delete Report
                          </button>
                          <button
                            onClick={() => {
                              handleShare(report._id);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition"
                          >
                            Share Link
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-slate-200 mb-4 leading-relaxed">
                  {report.description}
                </p>

                {/* Image */}
                {report.imageUrl && (
                  <div className="mb-5 -mx-5">
                    <Image
                      src={report.imageUrl}
                      alt="Report"
                      width={800}
                      height={600}
                      className="w-full rounded-2xl border border-slate-700 object-cover max-h-96 cursor-pointer hover:opacity-90 transition"
                      unoptimized
                      onClick={(e) => {
                        e.stopPropagation();
                        setEnlargedImage(report.imageUrl!);
                      }}
                    />
                  </div>
                )}

                {/* Claim Button - Full width on mobile */}
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
              </article>
            ))}

            {/* Load More */}
            {pagination.hasNext && (
              <div className="py-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={fetchingMore}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-sky-400 font-bold rounded-2xl transition"
                >
                  {fetchingMore ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Reports"
                  )}
                </button>
              </div>
            )}
          </div>
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
                setClaimData({ ...claimData, description: e.target.value })
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
                onClick={closeClaimModal}
                className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClaimSubmit}
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : null}
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Image */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <Image
              src={enlargedImage}
              alt="Enlarged"
              width={1200}
              height={800}
              className="rounded-3xl object-contain max-w-full max-h-[90vh] shadow-2xl"
              unoptimized
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-14 right-0 bg-slate-800/80 hover:bg-slate-700/80 text-white w-12 h-12 rounded-full flex items-center justify-center text-3xl font-light backdrop-blur"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

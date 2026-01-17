"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Filter, X } from "lucide-react";
import Navbar from "@/components/home/navigation/navbar";
import ReportCard, { ReportCardSkeleton } from "@/app/home/components/ReportCard";
import LoadMoreButton from "@/app/home/components/LoadMoreButton";
import ClaimModal from "@/app/home/components/ClaimModal";
import EnlargedImageModal from "@/app/home/components/EnlargedImageModal";
import type { Report, Pagination } from "@/app/home/types";
import { useUser } from "@clerk/nextjs";

export default function ExplorePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    hasNext: false,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  const { isLoaded } = useUser();

  const [toast, setToast] = useState<{
    message: string;
    isSuccess: boolean;
  } | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const showToast = (msg: string, success = true) => {
    setToast({ message: msg, isSuccess: success });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReports = useCallback(
    async (page = 1, append = false) => {
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
            append ? [...prev, ...newReports] : newReports,
          );
          setPagination(data.pagination);
        } else {
          const msg = data.error || "Failed to load reports";
          if (res.status === 429) {
            showToast("Daily limit reached. Try again tomorrow.", false);
          } else {
            showToast(msg, false);
          }
        }
      } catch (err) {
        showToast("Network error. Check your connection.", false);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [filterCategory, searchQuery],
  );

  useEffect(() => {
    if (isLoaded) fetchReports(1);
  }, [isLoaded, fetchReports]);

  useEffect(() => {
    const handleRefresh = () => fetchReports(1);
    window.addEventListener("reports:refresh", handleRefresh);
    return () => window.removeEventListener("reports:refresh", handleRefresh);
  }, [fetchReports]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
  };

  const hasActiveFilters = searchQuery !== "" || filterCategory !== "all";

  const filteredReports = useMemo(() => {
    if (!searchQuery) return reports;
    const query = searchQuery.toLowerCase();
    return reports.filter((report) =>
      report.description.toLowerCase().includes(query),
    );
  }, [reports, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <main className="max-w-3xl mx-auto border-x border-slate-700 bg-black/40">
        {/* Search & Filter Bar */}
        <div className="sticky top-0 lg:top-0 z-20 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700">
          <div className="px-4 py-3 sm:py-4">
            <div className="flex flex-col gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search lost items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-slate-800/70 border border-slate-700 rounded-xl sm:rounded-2xl text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 sm:focus:ring-4 focus:ring-sky-500/20 transition"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-full transition"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Filter & Clear */}
              <div className="flex gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Filter className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500 pointer-events-none" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-slate-800/70 border border-slate-700 rounded-xl sm:rounded-2xl text-sm sm:text-base text-white appearance-none focus:outline-none focus:border-sky-500 focus:ring-2 sm:focus:ring-4 focus:ring-sky-500/20 transition cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="electronics">📱 Electronics</option>
                    <option value="documents">📄 Documents/ID</option>
                    <option value="clothing">👕 Clothing</option>
                    <option value="accessories">💍 Wallet/Jewelry</option>
                    <option value="bags">🎒 Bag/Backpack</option>
                    <option value="keys">🔑 Keys</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl sm:rounded-2xl font-medium transition text-sm sm:text-base whitespace-nowrap"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/30">
                      Search: "{searchQuery}"
                    </span>
                  )}
                  {filterCategory !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/30 capitalize">
                      {filterCategory}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!loading && reports.length > 0 && (
          <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/30">
            <p className="text-xs sm:text-sm text-slate-400">
              {filteredReports.length === reports.length ? (
                <>
                  Showing <span className="text-white font-medium">{reports.length}</span> {reports.length === 1 ? "report" : "reports"}
                </>
              ) : (
                <>
                  Showing <span className="text-white font-medium">{filteredReports.length}</span> of{" "}
                  <span className="text-white font-medium">{reports.length}</span> reports
                </>
              )}
            </p>
          </div>
        )}

        {/* Reports List */}
        <div className="divide-y divide-slate-700">
          {loading ? (
            // Loading Skeletons
            <>
              <ReportCardSkeleton />
              <ReportCardSkeleton />
              <ReportCardSkeleton />
            </>
          ) : filteredReports.length === 0 ? (
            // Empty State
            <div className="py-16 sm:py-20 px-4 sm:px-6 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-slate-800/50 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border-2 border-dashed border-slate-700">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                    {reports.length === 0
                      ? "No reports yet"
                      : "No matching reports"}
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-lg mb-6 sm:mb-8">
                    {reports.length === 0
                      ? "Be the first to help someone find what they lost!"
                      : "Try adjusting your search or filters"}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-sky-600 hover:bg-sky-700 rounded-xl sm:rounded-2xl font-medium transition text-sm sm:text-base"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Reports List
            filteredReports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onDelete={(id) =>
                  setReports((prev) => prev.filter((r) => r._id !== id))
                }
                onShare={(id) => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/report/${id}`,
                  );
                  showToast("Link copied!");
                }}
                onClaim={(id) => {
                  setSelectedReportId(id);
                  setShowClaimModal(true);
                }}
              />
            ))
          )}
        </div>

        {/* Load More with Skeleton */}
        {fetchingMore && (
          <div className="divide-y divide-slate-700">
            <ReportCardSkeleton />
            <ReportCardSkeleton />
          </div>
        )}

        <LoadMoreButton
          hasNext={pagination.hasNext}
          loading={fetchingMore}
          onClick={() => fetchReports(pagination.page + 1, true)}
        />
      </main>

      <ClaimModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        reportId={selectedReportId}
        onSuccess={() => fetchReports(1)}
        showToast={showToast}
      />
      <EnlargedImageModal
        imageUrl={enlargedImage}
        onClose={() => setEnlargedImage(null)}
      />
    </div>
  );
}
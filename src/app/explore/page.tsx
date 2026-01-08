"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Filter } from "lucide-react";
import Navbar from "@/components/home/navigation/navbar";
import ReportCard from "@/app/home/components/ReportCard";
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
        showToast("Network error", false);
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

  const filteredReports = useMemo(() => {
    if (!searchQuery) return reports;
    const query = searchQuery.toLowerCase();
    return reports.filter((report) =>
      report.description.toLowerCase().includes(query),
    );
  }, [reports, searchQuery, filterCategory]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <main className="max-w-3xl mx-auto border-x border-slate-700 bg-black/40">
        {/* Search Filter */}
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

        <div className="divide-y divide-slate-700">
          {filteredReports.length === 0 ? (
            // Empty State
            <div className="py-20 px-6 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-slate-800/50 rounded-3xl p-12 border-2 border-dashed border-slate-700">
                  <div className="w-24 h-24 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {reports.length === 0
                      ? "No reports yet"
                      : "No reports match your search"}
                  </h3>
                  <p className="text-slate-400 text-lg mb-8">
                    {reports.length === 0
                      ? "Be the first to help someone find what they lost!"
                      : "Try adjusting your search or filters"}
                  </p>
                  {reports.length === 0 && (
                    <div className="text-sm text-slate-500">
                      Post something and start making a difference today.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Normal reports list
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

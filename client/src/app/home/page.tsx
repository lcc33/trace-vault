// src/app/home/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "@/components/home/navigation/navbar";
import ReportForm from "./components/ReportForm";
import SearchFilter from "./components/SearchFilter";
import ReportCard from "./components/ReportCard";
import LoadMoreButton from "./components/LoadMoreButton";
import ClaimModal from "./components/ClaimModal";
import EnlargedImageModal from "./components/EnlargedImageModal";
import type { Report, Pagination, ReportsResponse } from "./types";
import { useUser } from "@clerk/nextjs";

export default function HomePage() {
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
  const { user, isSignedIn, isLoaded } = useUser();
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
        <ReportForm onSuccess={() => fetchReports(1)} />
        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
        />
        <div className="divide-y divide-slate-700">
          {filteredReports.map((report) => (
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
          ))}
        </div>
        <LoadMoreButton
          hasNext={pagination.hasNext}
          loading={fetchingMore}
          onClick={() => fetchReports(pagination.page + 1, true)}
        />
      </main>

      {/*<Toast toast={toast} onClose={() => setToast(null)} />*/}
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

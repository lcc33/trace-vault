// src/app/home/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/home/navigation/navbar";
import ReportForm from "./components/ReportForm";
import ReportCard, { ReportCardSkeleton } from "./components/ReportCard";
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
    [],
  );

  useEffect(() => {
    if (isLoaded) fetchReports(1);
  }, [isLoaded, fetchReports]);

  useEffect(() => {
    const handleRefresh = () => fetchReports(1);
    window.addEventListener("reports:refresh", handleRefresh);
    return () => window.removeEventListener("reports:refresh", handleRefresh);
  }, [fetchReports]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <main className="max-w-3xl mx-auto border-x border-slate-700 bg-black/40">
        <ReportForm onSuccessAction={() => fetchReports(1)} />
        <div className="divide-y divide-slate-700">
          {loading ? (
            // Loading Skeletons
            <>
              <ReportCardSkeleton />
              <ReportCardSkeleton />
              <ReportCardSkeleton />
            </>
          ) : reports.length === 0 ? (
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
                    No reports yet
                  </h3>
                  <p className="text-slate-400 text-lg mb-8">
                    Be the first to help someone find what they lost!
                  </p>
                  <div className="text-sm text-slate-500">
                    Post something and start making a difference today.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Normal reports list
            reports.map((report) => (
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
        
        {/* Load More with skeleton on fetching more */}
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
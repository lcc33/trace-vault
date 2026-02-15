"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/home/navigation/navbar";
import ReportForm from "./components/ReportForm";
import ReportCard, { ReportCardSkeleton } from "./components/ReportCard";
import LoadMoreButton from "./components/LoadMoreButton";
import ClaimModal from "./components/ClaimModal";
import EnlargedImageModal from "./components/EnlargedImageModal";
import type { Report, Pagination } from "./types";
import { useUser } from "@clerk/nextjs";
import { AlertCircle, Clock } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

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

  const fetchReports = useCallback(async (page = 1, append = false) => {
    const isLoadMore = page > 1;
    if (isLoadMore) setFetchingMore(true);
    else setLoading(true);

    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      const res = await fetch(`/api/reports?${params}`);
      const data = await res.json();

      if (res.ok) {
        const newReports: Report[] = data.reports || [];
        setReports((prev) => (append ? [...prev, ...newReports] : newReports));
        setPagination(data.pagination);
      } else {
        if (res.status === 429) {
          const resetTime = data.reset
            ? new Date(data.reset).toLocaleTimeString()
            : "later";

          setError(
            data.message ||
              `Rate limit exceeded. Please try again after ${resetTime}`,
          );
          showToast("Too many requests. Please wait a moment.", false);
        } else if (res.status === 503) {
          setError(
            "Service temporarily unavailable. Please try again in a moment.",
          );
          showToast("Server is experiencing issues. Retrying...", false);

          setTimeout(() => {
            if (!append) fetchReports(page, append);
          }, 5000);
        } else if (res.status >= 500) {
          setError("Server error. Our team has been notified.");
          showToast("Something went wrong. Please try again.", false);
        } else {
          const msg = data.error || "Failed to load reports";
          setError(msg);
          showToast(msg, false);
        }
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Check your connection and try again.");
      showToast("Connection failed. Retrying...", false);

      setTimeout(() => {
        if (!append) fetchReports(page, append);
      }, 3000);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, []);

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

        {error && (
          <div className="border-b border-slate-700 bg-red-900/20 p-4">
            <div className="max-w-4xl mx-auto flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 text-sm sm:text-base font-medium">
                  {error}
                </p>
                <button
                  onClick={() => fetchReports(1)}
                  className="mt-2 text-xs sm:text-sm text-red-300 hover:text-red-200 underline"
                >
                  Try again
                </button>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 p-1"
                aria-label="Dismiss error"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-700">
          {loading ? (
            <>
              <ReportCardSkeleton />
              <ReportCardSkeleton />
              <ReportCardSkeleton />
            </>
          ) : reports.length === 0 && !error ? (
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

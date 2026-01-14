"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { MoreVertical, CheckCircle, Trash2, X } from "lucide-react";
import { formatRelativeTime } from "@/constants/dateFormatter";
import type { Report } from "../types";

interface Props {
  report: Report;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
  onClaim: (id: string) => void;
}

export default function ReportCard({
  report,
  onDelete,
  onShare,
  onClaim,
}: Props) {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isOwner = isSignedIn && report.reporterId === user?.id;
  const claimed = report.status === "claimed";
  const [loading, setLoading] = useState(true);

  // If report is claimed and within 4 days, show disabled button
  const isClaimed = report.status === "claimed";
  const claimedDate = report.claimed_at ? new Date(report.claimed_at) : null;
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
  const isWithinGracePeriod = claimedDate && claimedDate > fourDaysAgo;

  const handleClick = () => {
    if (!claimed) router.push(`/report/${report._id}`);
  };

  useEffect(() => {
    if (!user) {
      setMenuOpen(false);
      return;
    }
  }, [user]);
  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/reports/${report._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onDelete(report._id);
        setShowDeleteModal(false);
        setMenuOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete report");
      }
    } catch (err) {
      alert("Network error – check your connection");
    }
  };

  return (
    <>
      <article
        className={`p-5 transition-all ${
          claimed && !isWithinGracePeriod
            ? "opacity-60"
            : "hover:bg-slate-800/50"
        } ${!claimed ? "cursor-pointer" : ""}`}
        onClick={handleClick}
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
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{formatRelativeTime(report.createdAt)}</span>
                <span>•</span>
                <span className="capitalize">{report.category}</span>
                {claimed && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-green-400 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Claimed
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {isOwner && !claimed && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-full hover:bg-slate-700 transition"
              >
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-10 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-900/30 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Report
                  </button>
                  <button
                    onClick={() => {
                      onShare(report._id);
                      setMenuOpen(false);
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
        <p className="text-slate-200 mb-4 leading-relaxed break-words whitespace-pre-wrap">
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
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Claim Button */}
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          {!isOwner && isClaimed && isWithinGracePeriod ? (
            <div className="text-center py-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700 text-green-400 rounded-full text-sm font-medium">
                <CheckCircle className="w-5 h-5" />
                Claimed
              </span>
            </div>
          ) : !isOwner && !isClaimed ? (
            <button
              onClick={() => onClaim(report._id)}
              className="w-full px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl"
            >
              Claim This Item
            </button>
          ) : null}
          {isOwner && isClaimed && isWithinGracePeriod && (
            <div className="text-center py-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700 text-green-400 rounded-full text-sm font-medium">
                <CheckCircle className="w-5 h-5" />
                Item Claimed
              </span>
            </div>
          )}
          {isClaimed && !isWithinGracePeriod && (
            <div className="text-center py-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-400 rounded-full text-sm font-medium">
                <X className="w-5 h-5" />
                No longer available
              </span>
            </div>
          )}
        </div>
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-red-500" />
              Confirm Delete
            </h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this report? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

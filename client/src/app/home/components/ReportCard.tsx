"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { MoreVertical, CheckCircle } from "lucide-react";
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
  const isOwner = isSignedIn && report.reporterId === user?.id;
  const claimed = report.status === "claimed";

  const handleClick = () => {
    if (!claimed) router.push(`/report/${report._id}`);
  };

  return (
    <article
      className={`p-5 transition-all ${claimed ? "opacity-60" : "hover:bg-slate-800/50"} ${!claimed ? "cursor-pointer" : ""}`}
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
              <div className="absolute right-0 top-10 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20">
                <button
                  onClick={() => {
                    onDelete(report._id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/30 transition"
                >
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
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Claim Button or Claimed Badge */}
      <div className="mt-4" onClick={(e) => e.stopPropagation()}>
        {!isOwner && !claimed && (
          <button
            onClick={() => onClaim(report._id)}
            className="w-full px-8 py-4 bg-sky-800 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all transform active:scale-95 shadow-xl"
          >
            Claim This Item
          </button>
        )}
        {claimed && (
          <div className="text-center py-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700 text-green-400 rounded-full text-sm font-medium">
              <CheckCircle className="w-5 h-5" />
              This item has been claimed
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

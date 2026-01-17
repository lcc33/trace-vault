// src/app/claims/components/ClaimCard.tsx
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Mail,
} from "lucide-react";
import type { Claim } from "../types";

interface Props {
  claim: Claim;
  isReporterView: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onMarkClaimed: (reportId: string) => void;
  onEnlargeImage: (url: string) => void;
}

// Loading skeleton component
export function ClaimCardSkeleton() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 sm:p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Image skeleton */}
        <div className="w-full sm:w-48 h-48 bg-slate-700 rounded-xl flex-shrink-0" />
        
        <div className="flex-1 space-y-3">
          {/* Title skeleton */}
          <div className="h-6 bg-slate-700 rounded w-3/4" />
          
          {/* Subtitle skeleton */}
          <div className="h-4 bg-slate-700 rounded w-1/2" />
          
          {/* Description skeleton */}
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-slate-700 rounded w-full" />
            <div className="h-4 bg-slate-700 rounded w-5/6" />
            <div className="h-4 bg-slate-700 rounded w-4/6" />
          </div>
          
          {/* Status badge skeleton */}
          <div className="h-8 bg-slate-700 rounded-full w-24 mt-3" />
          
          {/* Buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="h-12 bg-slate-700 rounded-xl flex-1" />
            <div className="h-12 bg-slate-700 rounded-xl flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClaimCard({
  claim,
  isReporterView,
  onApprove,
  onReject,
  onMarkClaimed,
  onEnlargeImage,
}: Props) {
  const [imageLoading, setImageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const statusConfig = {
    pending: {
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      icon: Clock,
      label: "Pending Review",
    },
    approved: {
      color: "bg-green-500/20 text-green-400 border-green-500/50",
      icon: CheckCircle,
      label: "Approved",
    },
    rejected: {
      color: "bg-red-500/20 text-red-400 border-red-500/50",
      icon: XCircle,
      label: "Rejected",
    },
  };

  const config = statusConfig[claim.status];
  const Icon = config.icon;

  const handleAction = async (action: () => void) => {
    setActionLoading(true);
    try {
      await action();
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/report/${claim.reportId}`}
            className="text-sky-400 hover:text-sky-300 font-semibold text-base sm:text-lg flex flex-wrap items-center text-wrap gap-2 group break-words"
          >
            <span className="truncate flex flex-wrap lg:w-full w-40">{claim.reportTitle || "View Report"}</span>
            <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 flex-shrink-0" />
          </Link>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isReporterView ? (
              <>
                Claimed by: <strong className="text-slate-300">{claim.claimantName}</strong>
              </>
            ) : (
              <>Submitted on {formatDate(claim.createdAt)}</>
            )}
          </p>
        </div>
        
        {/* Status Badge */}
        <div
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 ${config.color} border whitespace-nowrap flex-shrink-0`}
        >
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{config.label}</span>
          <span className="sm:hidden">{claim.status}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 mb-4 text-sm sm:text-base leading-relaxed break-words">
        {claim.description}
      </p>

      {/* Proof Image */}
      {claim.proofImage && (
        <div className="mb-4 relative">
          {imageLoading && (
            <div className="absolute inset-0 bg-slate-700 rounded-xl animate-pulse" />
          )}
          <Image
            src={claim.proofImage}
            alt="Proof of ownership"
            width={800}
            height={400}
            className={`rounded-xl border border-slate-700 w-full max-h-64 sm:max-h-96 object-cover cursor-pointer hover:opacity-90 transition ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            unoptimized
            onClick={() => onEnlargeImage(claim.proofImage!)}
            onLoadingComplete={() => setImageLoading(false)}
          />
        </div>
      )}

      {/* Actions - Pending (Reporter View) */}
      {isReporterView && claim.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => handleAction(() => onApprove(claim._id))}
            disabled={actionLoading}
            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
          >
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Approve Claim</span>
          </button>
          <button
            onClick={() => handleAction(() => onReject(claim._id))}
            disabled={actionLoading}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
          >
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Reject Claim</span>
          </button>
        </div>
      )}

      {/* Actions - Approved */}
      {claim.status === "approved" && (
        <div className="mt-6 space-y-4">
          {/* Mark as Claimed - Reporter Only */}
          {isReporterView && (
            <button
              onClick={() => handleAction(() => onMarkClaimed(claim.reportId))}
              disabled={actionLoading}
              className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl sm:rounded-2xl transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Mark Report as Claimed
            </button>
          )}

          {/* Success Notification - Claimer View */}
          {!isReporterView && (
            <div className="p-4 sm:p-6 bg-green-900/30 border border-green-700 rounded-xl sm:rounded-2xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-500/20 rounded-full mb-3 sm:mb-4">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                </div>
                
                <p className="text-green-400 font-bold text-lg sm:text-xl mb-2 sm:mb-3">
                  🎉 Claim Approved!
                </p>
                
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Great news! The reporter approved your claim. Contact them below to arrange pickup.
                </p>

                <a
                  href={`mailto:${claim.reporterEmail}?subject=${encodeURIComponent(
                    "TraceVault: About My Approved Claim"
                  )}&body=${encodeURIComponent(
                    `Hi ${claim.reporterName || "there"},\n\n` +
                      `My claim for "${claim.reportTitle || "your item"}" was approved! ` +
                      `I'd love to arrange a time to pick it up.\n\n` +
                      `Please let me know when and where works best for you.\n\n` +
                      `Thank you for using TraceVault!\n\n` +
                      `Best regards`
                  )}`}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-10 py-3 sm:py-4 bg-sky-600 hover:bg-sky-700 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="truncate">Email: {claim.reporterEmail}</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rejected Info */}
      {claim.status === "rejected" && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-700/50 rounded-xl text-center">
          <p className="text-red-400 text-sm sm:text-base">
            {isReporterView 
              ? "You rejected this claim. The claimer has been notified."
              : "Unfortunately, your claim was not approved. You may try claiming other reports."}
          </p>
        </div>
      )}
    </div>
  );
}
// src/app/claims/components/ClaimCard.tsx
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  MessageCircle,
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

export default function ClaimCard({
  claim,
  isReporterView,
  onApprove,
  onReject,
  onMarkClaimed,
  onEnlargeImage,
}: Props) {
  const statusConfig = {
    pending: {
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      icon: Clock,
    },
    approved: {
      color: "bg-green-500/20 text-green-400 border-green-500/50",
      icon: CheckCircle,
    },
    rejected: {
      color: "bg-red-500/20 text-red-400 border-red-500/50",
      icon: XCircle,
    },
  };

  const config = statusConfig[claim.status];
  const Icon = config.icon;

  return (
    <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <div>
          <Link
            href={`/report/${claim.reportId}`}
            className="text-sky-400 hover:text-sky-300 font-semibold text-lg flex items-center gap-2 group"
          >
            {claim.reportTitle || "View Report"}
            <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
          </Link>
          <p className="text-sm text-slate-400 mt-1">
            {isReporterView ? (
              <>
                Claimed by: <strong>{claim.claimantName}</strong>
              </>
            ) : (
              <>Submitted {new Date(claim.createdAt).toLocaleDateString()}</>
            )}
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${config.color}`}
        >
          <Icon className="w-4 h-4" />
          {claim.status.toUpperCase()}
        </div>
      </div>

      <p className="text-slate-300 mb-4">{claim.description}</p>

      {claim.proofImage && (
        <Image
          src={claim.proofImage}
          alt="Proof"
          width={800}
          height={600}
          className="rounded-xl border border-slate-700 w-full max-h-96 object-cover cursor-pointer hover:opacity-90 mb-5"
          unoptimized
          onClick={() => onEnlargeImage(claim.proofImage!)}
        />
      )}

      {/* Pending Actions — Reporter Only */}
      {isReporterView && claim.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onApprove(claim._id)}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" /> Approve
          </button>
          <button
            onClick={() => onReject(claim._id)}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" /> Reject
          </button>
        </div>
      )}

      {/* Approved Actions */}
      {claim.status === "approved" && (
        <div className="mt-6 space-y-4">
          {/* WhatsApp Button for Claimer */}
          {!isReporterView && claim.reporterWhatsapp && (
            <a
              href={`https://wa.me/${claim.reporterWhatsapp.replace(/[^0-9]/g, "")}?text=Hi, my claim on your report was approved! Let's connect to return the item.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-2xl transition-all transform hover:scale-105 shadow-2xl"
            >
              <MessageCircle className="w-6 h-6" />
              Message Reporter on WhatsApp
            </a>
          )}

          {/* Mark as Claimed — Reporter Only */}
          {isReporterView && (
            <button
              onClick={() => onMarkClaimed(claim.reportId)}
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl transition shadow-xl"
            >
              Mark Report as Claimed
            </button>
          )}

          {/* Fallback if no WhatsApp (for claimer) */}
          {/*{!isReporterView && !claim.reporterWhatsapp && (
            <div className="p-4 bg-green-900/30 border border-green-700 rounded-xl text-center">
              <p className="text-green-400 font-medium">
                Your claim was approved! The owner will contact you soon.
              </p>
            </div>
          )}*/}
        </div>
      )}
    </div>
  );
}

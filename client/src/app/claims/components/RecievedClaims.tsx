// src/app/claims/components/ReceivedClaims.tsx
import ClaimCard from "./ClaimCard";
import { Clock } from "lucide-react";
import type { Claim } from "../types";

interface Props {
  claims: Claim[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onMarkClaimed: (reportId: string) => void;
  onEnlargeImage: (url: string) => void;
}

export default function ReceivedClaims({
  claims,
  onApprove,
  onReject,
  onMarkClaimed,
  onEnlargeImage,
}: Props) {
  if (claims.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
        <Clock className="w-16 h-16 mx-auto text-slate-600 mb-4" />
        <p className="text-slate-400 text-lg">
          No one has claimed your items yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-sky-300">
        Claims on Your Reports
      </h2>
      {claims.map((claim) => (
        <ClaimCard
          key={claim._id}
          claim={claim}
          isReporterView={true}
          onApprove={onApprove}
          onReject={onReject}
          onMarkClaimed={onMarkClaimed}
          onEnlargeImage={onEnlargeImage}
        />
      ))}
    </div>
  );
}

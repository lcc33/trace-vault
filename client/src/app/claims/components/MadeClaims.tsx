// src/app/claims/components/MadeClaims.tsx
import ClaimCard from "./ClaimCard";
import { Clock } from "lucide-react";
import type { Claim } from "../types";

interface Props {
  claims: Claim[];
  onEnlargeImage: (url: string) => void;
}

export default function MadeClaims({ claims, onEnlargeImage }: Props) {
  if (claims.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
        <Clock className="w-16 h-16 mx-auto text-slate-600 mb-4" />
        <p className="text-slate-400 text-lg">
          You haven't claimed any items yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-sky-300">Your Claims</h2>
      {claims.map((claim) => (
        <ClaimCard
          key={claim._id}
          claim={claim}
          isReporterView={false}
          onApprove={() => {}}
          onReject={() => {}}
          onMarkClaimed={() => {}}
          onEnlargeImage={onEnlargeImage}
        />
      ))}
    </div>
  );
}

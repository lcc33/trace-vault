// src/app/claims/types.ts
export interface Claim {
  _id: string;
  reportId: string;
  reportTitle?: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  reporterEmail: string;
  reporterName: string;
  description: string;
  proofImage?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

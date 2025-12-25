// src/app/claims/types.ts
export interface Claim {
  _id: string;
  reportId: string;
  reportTitle?: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  reporterWhatsapp?: string;
  description: string;
  proofImage?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

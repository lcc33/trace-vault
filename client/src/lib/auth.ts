// lib/auth.ts
import { auth } from "@clerk/nextjs/server";

export async function validateUserAccess(reportId: string, userId: string) {
  const report = await db.reports.findOne({ _id: reportId });
  if (!report) return null;
  
  // User can access if they're reporter or claimer in an active claim
  const claim = await db.claims.findOne({ 
    reportId, 
    $or: [{ claimerId: userId }, { reporterId: userId }],
    status: { $in: ['pending', 'accepted'] }
  });
  
  return report.reporterId === userId || claim ? report : null;
}
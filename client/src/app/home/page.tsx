// src/app/page.tsx
import { Metadata } from "next";
import Navbar from "@/components/home/navigation/navbar";
import ReportForm from "@/components/reports/ReportsForm";
import ReportsFeed from "@/components/reports/ReportsFeed";

// Optional: SEO
export const metadata: Metadata = {
  title: "TraceVault – Lost & Found Community",
  description:
    "Report lost items, claim found ones, and reunite with what matters.",
};

export interface Report {
  _id: string;
  reporterId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl?: string;
  status: string;
  user: {
    name?: string;
    email?: string;
    profilePic?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  totalPages: number;
}

interface ReportsResponse {
  reports: Report[];
  pagination: Pagination;
}

export default async function HomePage() {
  let initialReports: Report[] = [];
  let initialPagination: Pagination | null = null;

  try {
    // Relative URL → Next.js adds correct base (localhost or Vercel)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL || ""}/api/reports?limit=10&page=1`,
      {
        cache: "no-store", // Always fresh
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data: ReportsResponse = await res.json();
    initialReports = data.reports ?? [];
    initialPagination = data.pagination ?? null;
  } catch (error) {
    console.error("Failed to fetch initial reports:", error);
    // Continue rendering – show empty feed + form
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <main className="max-w-3xl mx-auto border-x border-slate-700 bg-black/40">
        <ReportForm />
        <ReportsFeed
          initialReports={initialReports}
          initialPagination={initialPagination ?? undefined}
        />
      </main>
    </div>
  );
}

import { Navbar } from "@/components";
import ReportsFeed from "@/components/reports/ReportsFeed";
import ReportForm from "@/components/reports/ReportsForm";

// Determine the base URL based on the environment
const baseUrl = process.env.NEXTAUTH_URL ;

export default async function HomePage() {
  // Use the absolute URL when fetching
  const res = await fetch(`${baseUrl}/api/reports`, {
    cache: "no-store",
  });
  const reports = await res.json();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <main className="max-w-3xl mx-auto border-x border-slate-700 bg-black/40">
        <ReportForm />
        <ReportsFeed initialReports={reports} />
      </main>
    </div>
  );
}
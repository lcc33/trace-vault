import { Navbar } from "@/components";
import ReportsFeed from "@/components/reports/ReportsFeed";
import ReportForm from "@/components/reports/ReportsForm";

export default async function HomePage() {
  try {
    // Use relative URL - Next.js handles the base automatically
    const res = await fetch('/api/reports', {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch reports: ${res.status}`);
    }
    
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
  } catch (error) {
    console.error('Error fetching reports:', error);
    // Return empty array as fallback
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar />
        <main className="max-w-3xl mx-auto border-x border-slate-700 bg-black/40">
          <ReportForm />
          <ReportsFeed initialReports={[]} />
        </main>
      </div>
    );
  }
}
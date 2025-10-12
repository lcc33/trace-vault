import { Navbar } from "@/components";
import ReportsFeed from "@/components/reports/ReportsFeed";
import ReportForm from "@/components/reports/ReportsForm";

export default async function HomePage() {
  // fetch initial reports from API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reports`, {
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

import ReportsFeed from "@/components/reports/ReportsFeed";
import ReportForm from "@/components/reports/ReportsForm";
import Navbar from "@/components/home/navigation/navbar";
const baseUrl = process.env.NEXTAUTH_URL;

export default async function HomePage() {
  try {
    // Use relative URL - Next.js handles the base automatically
    const res = await fetch(`${baseUrl}/api/reports`, {
      cache: "no-store",
    });
    
    const reports = await res.json();
    if (!res.ok) {
      throw new Error(`Failed to fetch reports: ${Error}`);

    }

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
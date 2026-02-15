import Navbar from "@/components/home/navigation/navbar";

export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 sm:p-8 animate-pulse">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-700 flex-shrink-0" />
        <div className="flex-1 w-full space-y-3 text-center sm:text-left">
          <div className="h-8 sm:h-9 bg-slate-700 rounded w-48 mx-auto sm:mx-0" />
          <div className="h-5 bg-slate-700 rounded w-64 mx-auto sm:mx-0" />
        </div>
      </div>
    </div>
  );
}

export function ReportCardSkeleton() {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 animate-pulse">
      <div className="h-40 sm:h-48 bg-slate-700" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-700 rounded w-3/4" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-700 rounded w-20" />
          <div className="h-4 bg-slate-700 rounded w-24" />
        </div>
        <div className="flex justify-end">
          <div className="h-4 bg-slate-700 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <div className="p-4 sm:p-6 pb-24 lg:pb-6">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <ProfileHeaderSkeleton />
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="h-7 sm:h-8 bg-slate-700 rounded w-32 sm:w-40 animate-pulse" />
              <div className="h-6 bg-slate-700 rounded w-20 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <ReportCardSkeleton />
              <ReportCardSkeleton />
              <ReportCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
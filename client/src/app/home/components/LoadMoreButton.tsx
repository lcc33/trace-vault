// src/app/home/components/LoadMoreButton.tsx
import { Loader2 } from "lucide-react";

interface Props {
  hasNext: boolean;
  loading: boolean;
  onClick: () => void;
}

export default function LoadMoreButton({ hasNext, loading, onClick }: Props) {
  if (!hasNext) return null;
  return (
    <div className="py-8 text-center">
      <button
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-sky-400 font-bold rounded-2xl transition"
      >
        {loading ? <Loader2 className="animate-spin" /> : null}
        {loading ? "Loading..." : "Load More Reports"}
      </button>
    </div>
  );
}

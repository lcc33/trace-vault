// src/app/home/components/SearchFilter.tsx
import { Search, Filter } from "lucide-react";

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: string;
  setFilterCategory: (c: string) => void;
}

export default function SearchFilter({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
}: Props) {
  return (
    <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/70 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-12 pr-10 py-3 bg-slate-800/70 border border-slate-700 rounded-2xl text-white appearance-none focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition min-w-[140px]"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Phone</option>
              <option value="documents">ID Card</option>
              <option value="bags">Bag</option>
              <option value="accessories">Wallet</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

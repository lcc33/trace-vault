// src/app/claims/components/ClaimsTabs.tsx
interface Props {
  activeTab: "made" | "received";
  setActiveTab: (tab: "made" | "received") => void;
  madeCount: number;
  receivedCount: number;
}

export default function ClaimsTabs({
  activeTab,
  setActiveTab,
  madeCount,
  receivedCount,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row border-b border-slate-700 mb-8">
      <button
        onClick={() => setActiveTab("received")}
        className={`px-6 py-3 font-medium text-center transition-colors relative ${
          activeTab === "received"
            ? "text-sky-400 border-b-2 border-sky-400"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Claims on My Reports ({receivedCount})
      </button>
      <button
        onClick={() => setActiveTab("made")}
        className={`px-6 py-3 font-medium text-center transition-colors relative ${
          activeTab === "made"
            ? "text-sky-400 border-b-2 border-sky-400"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        My Claims ({madeCount})
      </button>
    </div>
  );
}

"use client";

import Sidebar from "./components/sidebar";
import Link from "next/link";

export default function DocsPage() {
  return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Sidebar />
        <main className="md:ml-64 p-6">
          <h1 className="text-3xl font-bold mb-4">Documentation Home</h1>
          <p>Welcome to the TraceVault documentation!</p>
          </main>
    </div>
  );
}

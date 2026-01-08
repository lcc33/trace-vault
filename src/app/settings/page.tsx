"use client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Navbar } from "@/components";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <p className="text-center">
          Please{" "}
          <Link href="/sign-in" className="text-sky-400 hover:underline">
            sign in
          </Link>{" "}
          to view your profile.
        </p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      Settings Page Content
    </div>
  );
}

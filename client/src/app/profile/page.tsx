// src/app/profile/page.tsx

"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components";

interface Report {
  _id: string;
  description: string;
  category: string;
  createdAt: string;
  imageUrl?: string;
  claimCount?: number;
}

export default function ProfilePage() {
  const { user, isLoaded: userLoaded } = useUser();
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/user"); // ← No query param
      if (!res.ok) throw new Error("Failed");
      const reports = await res.json();
      setUserReports(reports);
    } catch (error) {
      console.error("Error:", error);
      setUserReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoaded && user) {
      fetchUserReports();
    }
  }, [userLoaded, user]);

  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

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

  const displayName =
    user.fullName || user.emailAddresses[0]?.emailAddress || "User";
  const email = user.emailAddresses[0]?.emailAddress || "No email";
  const avatarUrl = user.imageUrl || "/default-avatar.png";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />

      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Image
                src={avatarUrl}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full object-cover border-4 border-slate-700"
              />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-white">{displayName}</h1>
                <p className="text-slate-400 mt-1">{email}</p>
              </div>
            </div>
          </div>

          {/* Reports Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
              Your Reports
              <span className="text-sky-400 text-lg font-normal">
                {userReports.length}{" "}
                {userReports.length === 1 ? "Report" : "Reports"}
              </span>
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                <p className="mt-4 text-slate-400">Loading your reports...</p>
              </div>
            ) : userReports.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                <p className="text-slate-400 text-lg">
                  You haven't created any reports yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userReports.map((report) => (
                  <Link
                    key={report._id}
                    href={`/report/${report._id}`}
                    className="block group"
                  >
                    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-700 hover:border-sky-600">
                      {report.imageUrl ? (
                        <div className="relative h-48">
                          <Image
                            src={report.imageUrl}
                            alt="Report"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                          <span className="text-slate-500 text-lg">
                            No Image
                          </span>
                        </div>
                      )}
                      <div className="p-5">
                        <p className="text-white font-medium line-clamp-2 mb-2">
                          {report.description}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">
                            {report.category}
                          </span>
                          <span className="text-slate-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {report.claimCount !== undefined && (
                          <div className="mt-3 text-right">
                            <span className="inline-flex items-center gap-1 text-xs text-sky-400">
                              {report.claimCount} claim
                              {report.claimCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

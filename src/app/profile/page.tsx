// src/app/profile/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components";
import { Loader2, FileText, Calendar } from "lucide-react";

interface Report {
  _id: string;
  description: string;
  category: string;
  createdAt: string;
  imageUrl?: string;
  claimCount?: number;
}

// Profile Header Skeleton
function ProfileHeaderSkeleton() {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 sm:p-8 animate-pulse">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Avatar skeleton */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-700 flex-shrink-0" />
        <div className="flex-1 w-full space-y-3 text-center sm:text-left">
          {/* Name skeleton */}
          <div className="h-8 sm:h-9 bg-slate-700 rounded w-48 mx-auto sm:mx-0" />
          {/* Email skeleton */}
          <div className="h-5 bg-slate-700 rounded w-64 mx-auto sm:mx-0" />
        </div>
      </div>
    </div>
  );
}

// Report Card Skeleton
function ReportCardSkeleton() {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 animate-pulse">
      {/* Image skeleton */}
      <div className="h-40 sm:h-48 bg-slate-700" />
      
      <div className="p-4 sm:p-5 space-y-3">
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-700 rounded w-3/4" />
        </div>
        
        {/* Meta info skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-700 rounded w-20" />
          <div className="h-4 bg-slate-700 rounded w-24" />
        </div>
        
        {/* Claims count skeleton */}
        <div className="flex justify-end">
          <div className="h-4 bg-slate-700 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// Full Page Skeleton
function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <div className="p-4 sm:p-6 pb-24 lg:pb-6">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <ProfileHeaderSkeleton />
          
          {/* Reports section skeleton */}
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

export default function ProfilePage() {
  const { user, isLoaded: userLoaded } = useUser();

  const [userReports, setUserReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  // Fetch reports
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const reportsRes = await fetch("/api/reports/user");

      if (!reportsRes.ok) {
        throw new Error("Failed to load reports");
      }

      const reports = await reportsRes.json();
      setUserReports(reports);
      
      // Initialize loading states for images
      const loadingStates: Record<string, boolean> = {};
      reports.forEach((report: Report) => {
        if (report.imageUrl) {
          loadingStates[report._id] = true;
        }
      });
      setImageLoadingStates(loadingStates);
      
    } catch (err) {
      setError("Failed to load profile data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoaded && user) {
      fetchData();
    }
  }, [userLoaded, user]);

  const handleImageLoad = (reportId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [reportId]: false }));
  };

  // Show skeleton while loading
  if (!userLoaded || loading) {
    return <ProfilePageSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-lg sm:text-xl text-slate-300 mb-4">
            Please sign in to view your profile
          </p>
          <Link
            href="/sign-in"
            className="inline-block px-8 py-3 bg-sky-600 hover:bg-sky-700 rounded-xl font-medium transition"
          >
            Sign In
          </Link>
        </div>
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
      <main className="p-4 sm:p-6 pb-24 lg:pb-6">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          {/* Profile Header */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <Image
                src={avatarUrl}
                alt="Profile"
                width={128}
                height={128}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-slate-700 shadow-xl"
                priority
              />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
                  {displayName}
                </h1>
                <p className="text-slate-400 mt-1 text-sm sm:text-base break-all">
                  {email}
                </p>
                
                {/* Stats */}
                <div className="flex gap-4 sm:gap-6 mt-4 sm:mt-6 justify-center sm:justify-start">
                  <div className="text-center sm:text-left">
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      {userReports.length}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {userReports.length === 1 ? "Report" : "Reports"}
                    </p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xl sm:text-2xl font-bold text-white">
                      {userReports.reduce((sum, r) => sum + (r.claimCount || 0), 0)}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400">Total Claims</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl flex items-start gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-medium text-sm sm:text-base">{error}</p>
                <button
                  onClick={fetchData}
                  className="mt-2 text-xs sm:text-sm text-red-300 hover:text-red-200 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Reports Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
                Your Reports
              </span>
              <span className="text-sky-400 text-sm sm:text-lg font-normal">
                {userReports.length}
              </span>
            </h2>

            {userReports.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                <div className="max-w-md mx-auto px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" />
                  </div>
                  <p className="text-slate-400 text-base sm:text-lg mb-6">
                    You haven't created any reports yet
                  </p>
                  <Link
                    href="/home"
                    className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-sky-600 hover:bg-sky-700 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    Create Your First Report
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {userReports.map((report) => (
                  <Link
                    key={report._id}
                    href={`/report/${report._id}`}
                    className="block group"
                  >
                    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-700 hover:border-sky-600 h-full flex flex-col">
                      {report.imageUrl ? (
                        <div className="relative h-40 sm:h-48 overflow-hidden">
                          {imageLoadingStates[report._id] && (
                            <div className="absolute inset-0 bg-slate-700 animate-pulse" />
                          )}
                          <Image
                            src={report.imageUrl}
                            alt="Report"
                            fill
                            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                              imageLoadingStates[report._id] ? "opacity-0" : "opacity-100"
                            }`}
                            unoptimized
                            onLoadingComplete={() => handleImageLoad(report._id)}
                          />
                        </div>
                      ) : (
                        <div className="h-40 sm:h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600" />
                        </div>
                      )}
                      
                      <div className="p-4 sm:p-5 flex-1 flex flex-col">
                        <p className="text-white font-medium line-clamp-2 mb-3 text-sm sm:text-base flex-1">
                          {report.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-slate-400 capitalize px-2 py-1 bg-slate-700/50 rounded-full">
                              {report.category}
                            </span>
                            <span className="text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(report.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          
                          {report.claimCount !== undefined && report.claimCount > 0 && (
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-sky-500/20 text-sky-400 rounded-full font-medium">
                                {report.claimCount} claim{report.claimCount !== 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
// src/app/profile/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components";
import { SignOutButton } from "@/components/home/navigation/logout";

interface Report {
  _id: string;
  description: string;
  category: string;
  createdAt: string;
  imageUrl?: string;
}

export default function ProfilePage() {
  const { user, isLoaded: userLoaded } = useUser();
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserReports = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/user?userId=${userId}`);
      if (!res.ok) {
        console.error(`API Error: ${res.status}`);
        setUserReports([]);
        return;
      }
      const reports = await res.json();
      setUserReports(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setUserReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoaded && user) {
      fetchUserReports(user.id); // ← user.id is safe here
    }
  }, [userLoaded, user]);

  // Loading
  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  // Not signed in (shouldn't happen due to middleware, but safe)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 flex flex-col items-center justify-center">
        <p>
          Please{" "}
          <Link
            href="/sign-in"
            className="text-sky-400 hover:text-sky-300 underline"
          >
            sign in
          </Link>{" "}
          to view your profile.
        </p>
      </div>
    );
  }

  const userDisplayName =
    user.fullName || user.emailAddresses[0]?.emailAddress || "User";
  const userEmail = user.emailAddresses[0]?.emailAddress || "N/A";
  const userImageUrl = user.imageUrl || "/default-avatar.png";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />

      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* User Info */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <Image
                src={userImageUrl}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold">{userDisplayName}</h1>
                <p className="text-slate-400">{userEmail}</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <SignOutButton />
            </div>
          </div>

          {/* User's Reports */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Your Reports ({userReports.length})
            </h2>

            {loading ? (
              <p className="text-slate-400">Loading your reports...</p>
            ) : userReports.length === 0 ? (
              <p className="text-slate-400">
                You haven't created any reports yet.{" "}
                <Link href="/" className="text-sky-400 hover:underline">
                  Create one
                </Link>
                .
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {userReports.map((report) => (
                  <div
                    key={report._id}
                    className="bg-slate-800 rounded-lg p-4 flex flex-col h-full shadow-md"
                  >
                    {report.imageUrl ? (
                      <div className="w-full h-40 mb-3 relative">
                        <Image
                          src={report.imageUrl}
                          alt="Report"
                          fill
                          className="object-cover rounded-lg border border-slate-700"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 mb-3 bg-slate-700 flex items-center justify-center rounded-lg">
                        <span className="text-slate-400 text-sm">No Image</span>
                      </div>
                    )}
                    <p className="flex-1 text-sm mb-2 text-slate-100 line-clamp-3">
                      {report.description}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xs text-slate-400">
                        {report.category} •{" "}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/report/${report._id}`}
                        className="text-sky-400 hover:text-sky-300 text-xs font-semibold px-3 py-1 rounded-full border border-sky-400 hover:bg-sky-400/10 transition"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

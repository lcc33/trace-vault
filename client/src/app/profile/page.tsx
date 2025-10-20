// src/app/profile/page.tsx
"use client";

import { useSession } from "next-auth/react";
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
  claimCount: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserReports();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchUserReports = async () => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔍 Starting to fetch user reports...');
      const res = await fetch("/api/reports/user");
      
      console.log('📡 Response status:', res.status);
      console.log('📡 Response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Response error:', errorText);
        
        if (res.status === 401) {
          throw new Error("Please sign in to view your reports");
        }
        throw new Error(`Failed to load reports: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('📦 Received data:', data);
      console.log('📦 Data type:', typeof data);
      console.log('📦 Is array?:', Array.isArray(data));
      console.log('📦 Data length:', Array.isArray(data) ? data.length : 'N/A');
      
      // Ensure we have an array
      if (Array.isArray(data)) {
        console.log(`✅ Setting ${data.length} reports to state`);
        setUserReports(data);
      } else {
        console.error("❌ Expected array but got:", data);
        setUserReports([]);
        setError("Invalid data received from server");
      }
      
    } catch (error: any) {
      console.error("❌ Error fetching user reports:", error);
      setError(error.message || "Failed to load your reports");
      setUserReports([]);
    } finally {
      setLoading(false);
      console.log('🏁 Loading set to false');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Please sign in to view your profile</p>
          <Link 
            href="/login" 
            className="text-sky-400 hover:text-sky-300 font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering profile page with:', {
    loading,
    error,
    reportsCount: userReports.length,
    session: !!session
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
     
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* User Info */}
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <Image
                src={session.user?.image || "/default-avatar.png"}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">{session.user?.name}</h1>
                <p className="text-slate-400">{session.user?.email}</p>
              </div>
            </div>
          </div>

          {/* User's Reports */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Your Reports ({userReports.length})
            </h2>
            
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
                <p className="text-red-400">{error}</p>
                <button
                  onClick={fetchUserReports}
                  className="mt-2 text-red-300 hover:text-red-200 text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center py-8">
                <p className="text-slate-400">Loading your reports...</p>
              </div>
            ) : userReports.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-slate-800 rounded-lg p-8 max-w-md mx-auto">
                  <p className="text-slate-300 text-lg mb-4">
                    You have not created any reports yet.
                  </p>
                  <Link
                    href="/home"
                    className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                  >
                    Create Your First Report
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {userReports.map((report) => (
                  <div
                    key={report._id}
                    className="bg-slate-800 rounded-lg p-4 flex flex-col h-full shadow-md hover:shadow-lg transition"
                  >
                    {report.imageUrl && report.imageUrl !== "/placeholder-image.png" ? (
                      <div className="w-full h-40 mb-3 relative">
                        <Image
                          src={report.imageUrl}
                          alt="Report Image"
                          fill
                          className="object-cover rounded-lg border border-slate-700"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 mb-3 bg-slate-700 flex items-center justify-center rounded-lg">
                        <span className="text-slate-400">No Image</span>
                      </div>
                    )}
                    
                    <p className="flex-1 text-base mb-2 text-slate-100 line-clamp-3">
                      {report.description}
                    </p>
                    
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400">
                          {report.category} • {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-sky-400 mt-1">
                          {report.claimCount} claim{report.claimCount !== 1 ? 's' : ''}
                        </span>
                      </div>
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
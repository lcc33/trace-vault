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
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserReports();
    }
  }, [session]);

  const fetchUserReports = async () => {
    try {
      const res = await fetch('/api/reports/user');
      const reports = await res.json();
      setUserReports(reports);
    } catch (error) {
      console.error('Error fetching user reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div className="">Please <Link href={"/login"}>sign in</Link>  to view your profile</div>;
  }

  return (
    <>
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
          <div className="flex justify-end">
          
          </div>
        </div>

        {/* User's Reports */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Reports ({userReports.length})</h2>
          {loading ? (
            <p>Loading your reports...</p>
          ) : userReports.length === 0 ? (
            <p className="text-slate-400">You haven't created any reports yet.</p>
          ) : (
            <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {userReports.map((report) => (
                <div key={report._id} className="bg-slate-800 rounded-lg p-4 flex flex-col h-full shadow-md">
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
                  <p className="flex-1 text-base mb-2 text-slate-100">{report.description}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs text-slate-400">
                      {report.category} • {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/report/${report._id}`}
                      className="text-sky-400 hover:text-sky-300 text-xs font-semibold px-3 py-1 rounded-full border border-sky-400 hover:bg-sky-400/10 transition"
                    >
                      View Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
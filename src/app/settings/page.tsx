"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components";
import {
  LogOut,
  Trash2,
  Shield,
  Bell,
  User,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";

// Loading skeleton
function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 lg:pb-6">
        <div className="h-9 bg-slate-800 rounded-lg w-32 mb-8 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 animate-pulse"
            >
              <div className="h-6 bg-slate-700 rounded w-48 mb-4" />
              <div className="h-4 bg-slate-700 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push("/sign-in");
    } catch (err) {
      console.error("Sign out error:", err);
      setError("Failed to sign out. Please try again.");
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Delete all user data from MongoDB
      const deleteDataRes = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!deleteDataRes.ok) {
        const data = await deleteDataRes.json();
        throw new Error(data.error || "Failed to delete user data");
      }

      // 2. Delete Clerk account
      await user?.delete();

      // 3. Sign out and redirect
      await signOut();
      router.push("/");
    } catch (err: any) {
      console.error("Delete account error:", err);
      setError(err.message || "Failed to delete account. Please try again.");
      setLoading(false);
    }
  };

  // Show skeleton while loading
  if (!isLoaded) {
    return <SettingsSkeleton />;
  }

  // Redirect if not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg mb-4">Please sign in to view settings</p>
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

  const userEmail = user.primaryEmailAddress?.emailAddress || "No email";
  const userName = user.fullName || user.firstName || "User";
  const avatarUrl = user.imageUrl;

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 lg:pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
            Settings
          </h1>

          <div className="space-y-6">
            {/* Account Information */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-sky-400" />
                <h2 className="text-xl font-bold">Account Information</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border-4 border-slate-700"
                />
                <div className="text-center sm:text-left">
                  <p className="text-lg font-semibold text-white">{userName}</p>
                  <p className="text-sm text-slate-400">{userEmail}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Member since{" "}
                    {new Date(user.createdAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-slate-700/30 border border-slate-600 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Account Verified
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Your account is protected by Clerk authentication
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-sky-400" />
                <h2 className="text-xl font-bold">Preferences</h2>
              </div>

              <div className="space-y-4">
                {/* <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600">
                  <div>
                    <p className="font-medium text-white">
                      Email Notifications
                    </p>
                    <p className="text-sm text-slate-400">
                      Get notified when someone claims your report
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div> */}

                <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-sky-300">
                      More settings and preferences coming soon! We're working
                      on adding customization options.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Actions */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-sky-400" />
                <h2 className="text-xl font-bold">Account Actions</h2>
              </div>

              <div className="space-y-3">
                {/* Sign Out Button */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600 hover:border-sky-500 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-slate-400 group-hover:text-sky-400" />
                    <div className="text-left">
                      <p className="font-medium text-white">Sign Out</p>
                      <p className="text-sm text-slate-400">
                        Sign out from this device
                      </p>
                    </div>
                  </div>
                </button>

                {/* Delete Account Button */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-between p-4 bg-red-900/20 hover:bg-red-900/30 border border-red-700/50 hover:border-red-600 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <div className="text-left">
                      <p className="font-medium text-red-400">Delete Account</p>
                      <p className="text-sm text-red-300/70">
                        Permanently delete your account and all data
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </section>

            {/* App Info */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <div className="text-center text-sm text-slate-400 space-y-2">
                <p>TraceVault v1.0.0</p>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Sign Out Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !loading && setShowLogoutModal(false)}
        >
          <div
            className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <LogOut className="w-6 h-6 text-sky-400" />
              Sign Out
            </h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to sign out? You'll need to sign in again to
              access your account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={loading}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !loading && setShowDeleteModal(false)}
        >
          <div
            className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-red-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-red-500" />
              Delete Account
            </h3>

            <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-300">
                  <p className="font-bold mb-2">
                    This action cannot be undone!
                  </p>
                  <p>This will permanently delete:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Your account</li>
                    <li>All your reports</li>
                    <li>All your claims</li>
                    <li>All associated data</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type <span className="font-bold text-white">DELETE</span> to
                confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => {
                  setDeleteConfirmation(e.target.value);
                  setError(null);
                }}
                placeholder="DELETE"
                disabled={loading}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                  setError(null);
                }}
                disabled={loading}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirmation !== "DELETE"}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

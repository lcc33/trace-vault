// src/app/not-found.tsx
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 – Page Not Found | TraceVault",
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>

      <div className="relative z-10 text-center p-8 backdrop-blur-sm rounded-xl shadow-2xl max-w-md">
        <h1 className="text-9xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse">
          404
        </h1>
        <p className="text-3xl font-light mb-6 text-gray-300">Page Not Found</p>
        <p className="text-gray-400 mb-10">
          Looks like you got lost in the vault :)
        </p>

        {/* Use Link instead of router.back() */}
        <Link
          href="/"
          className="inline-block px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-pink-500/50"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

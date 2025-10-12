// app/not-found.tsx
import Link from 'next/link';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: '404 – Page Not Found',
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white relative overflow-hidden">
      
    
       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 text-center p-8  backdrop-blur-sm rounded-xl shadow-2xl">
        
        {/* Animated Error Code */}
        <h1 className="text-9xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse">
          404
        </h1>
        
        {/* Animated Message */}
        <p className="text-3xl font-light mb-6 text-gray-300 animate-fade-in">
          Page Not Found
        </p>

        <div className="mb-10">
          <p className="text-gray-400">
            Looks like you are lost :).
          </p>
        </div>

        {/* Home Button with Hover Animation */}
        <Link 
          href="/" 
          className="inline-block px-8 py-3 text-lg font-semibold rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-pink-500/50"
        >
          Take Me Back Home
        </Link>
      </div>
    </div>
  );
}
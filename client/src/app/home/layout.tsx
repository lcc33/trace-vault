// app/layout.tsx or your main layout
"use client";
import Sidebar from "@/components/home/navigation/navbar";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<SessionProvider>
        <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-screen">
              {children}
            </main>
          </div>
      </SessionProvider>
  );
}
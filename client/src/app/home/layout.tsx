// app/layout.tsx or your main layout
"use client";
import { Navbar } from "@/components";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {/* <Navbar /> */}
      {children}
    </SessionProvider>
  );
}

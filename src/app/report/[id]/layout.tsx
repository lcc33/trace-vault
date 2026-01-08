"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components";

export default function DynamicReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <Navbar />
      {children}
    </ClerkProvider>
  );
}

"use client";
import { ClerkProvider } from "@clerk/nextjs";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}

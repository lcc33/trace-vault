"use client";
import { ClerkProvider } from "@clerk/nextjs";

export default function claimsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}

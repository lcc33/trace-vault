"use client";
import { ClerkProvider } from "@clerk/nextjs";

export default function exploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}

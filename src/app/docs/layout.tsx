"use client";
import { ClerkProvider } from "@clerk/nextjs";

export default function docsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}

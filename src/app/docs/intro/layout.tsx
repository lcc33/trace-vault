"use client";
import { ClerkProvider } from "@clerk/nextjs";

export default function docsIntroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}

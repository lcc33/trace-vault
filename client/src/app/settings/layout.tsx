"use client";
import { ClerkProvider } from "@clerk/nextjs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}

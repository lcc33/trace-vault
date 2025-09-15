import { Footer } from "@/components";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import React from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        " font-sans",
        inter.className
      )}
    >
      <main >{children}</main>
      <Footer />
    </div>
  );
}

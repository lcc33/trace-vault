import { Footer } from "@/components";
import { Inter } from "next/font/google";
import React from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full font-sans">
      <main>{children}</main>
      <Footer />
    </div>
  );
}

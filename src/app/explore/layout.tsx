import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Lost & Found Items",
  description: "Browse the latest lost and found items in your community. Help reunite people with their belongings.",
  openGraph: {
    title: "Community Discovery | TraceVault",
    description: "Search for lost keys, phones, wallets, and more in Nigeria.",
    images: [{ url: "/assets/logo.jpeg" }],
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
import { Metadata } from "next";

export const SITE_CONFIG: Metadata = {
  title: {
    default: "TraceVault – Lost It? Found It.",
    template: `%s | TraceVault`
  },
  description: "TraceVault helps students and campus communities report and recover lost items seamlessly.",
  icons: {
    icon: [
      {
        url: "/icons/favicon.ico",
        href: "/icons/favicon.ico",
      }
    ]
  },
  openGraph: {
    title: "TraceVault – Lost It? Found It.",
    description: "TraceVault is the smart, simple way to manage lost and found on campus.",
    images: [
      {
        url: "/assets/logo.jpeg",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    creator: "@kindra",
    title: "TraceVault – Lost It? Found It.",
    description: "Lost something? Found something? TraceVault connects people to reunite items with their rightful owners.",
    images: [
      {
        url: "/assets/logo.jpeg",
      }
    ]
  },
  metadataBase: new URL("https://tracevault.vercel.app"),
};


// Optional: SEO
export const metadata: Metadata = {
  title: "TraceVault – Lost & Found Community",
  description:
    "Report lost items, claim found ones, and reunite with what matters.",
};

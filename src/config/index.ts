import { Metadata } from "next";

export const SITE_CONFIG: Metadata = {
  title: {
    default: "TraceVault | Secure Lost & Found for Communities",
    template: `%s | TraceVault`,
  },
  description:
    "The safest community-driven lost and found platform in Nigeria. Report missing items, claim found property, and reunite with your belongings securely. No spam, just results.",
  keywords: [
    "lost and found Nigeria",
    "campus lost and found",
    "report lost item",
    "claim found item",
    "secure lost and found",
    "unilorin lost and found",
    "tracevault",
    "recover missing belongings",
    "secure item recovery",
    "student lost and found",
    "Lagos community lost and found",
    "found items tracker",
  ],
  authors: [{ name: "TraceVault Team", url: "https://tracevault.xyz" }],
  creator: "TraceVault",
  publisher: "TraceVault",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://app.tracevault.xyz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TraceVault – Lost It? Found It. Recovered.",
    description:
      "Join the secure movement to reunite lost items with their owners. Built for communities, hardened against spam.",
    url: "https://app.tracevault.xyz",
    siteName: "TraceVault",
    images: [
      {
        url: "/assets/logo.jpeg",
        width: 1200,
        height: 630,
        alt: "TraceVault - Secure Lost and Found",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TraceVault – Reuniting Communities",
    description:
      "The fastest way to find what you've lost on campus. Secure, fast, and community-powered.",
    creator: "@tracevault",
    images: ["/assets/logo.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "-eZUv5zWjDaMw-iloRF20uitn-JBTmtUaDWklDjqMjM",
  },
};

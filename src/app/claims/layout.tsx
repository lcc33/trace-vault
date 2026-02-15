import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Claims",
  description: "View and manage your lost and found claims. Track your recovery progress in real-time.",
  openGraph: {
    title: "Manage Your Claims | TraceVault",
    description: "Keep track of the items you've found or claimed on TraceVault.",
  },
};

export default function ClaimsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
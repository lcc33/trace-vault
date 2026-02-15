import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your TraceVault account preferences, notifications, and security settings.",
  openGraph: {
    title: "Account Settings | TraceVault",
    description:
      "Update your profile and manage how you interact with the TraceVault community.",
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative flex min-h-screen flex-col">
      {children}
    </section>
  );
}

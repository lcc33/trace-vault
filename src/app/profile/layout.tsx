import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your TraceVault reports and account settings.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
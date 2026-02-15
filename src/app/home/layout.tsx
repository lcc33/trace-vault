import { ClerkProvider } from "@clerk/nextjs";
import { SITE_CONFIG } from "@/config";

export const metadata = SITE_CONFIG;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}

"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded: userLoaded } = useUser();
  const Router = useRouter();
  if (!user) {
    Router.push("/sign-in");
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}

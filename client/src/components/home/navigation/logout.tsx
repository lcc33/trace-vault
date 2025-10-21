"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
const baseurl = process.env.NEXTAUTH_URL;

export default function LogoutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: `${baseurl}/login` })}
      className="hover:text-foreground/80 text-sm font-semibold font-sans"
    >
      Logout
    </Button>
  );
}

"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="hover:text-foreground/80 text-sm font-semibold font-sans"
    >
      Logout
    </Button>
  );
}

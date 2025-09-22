"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-6">Sign in to TraceVault</h1>
      <Button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Sign in with Google
      </Button>
    </div>
  );
}

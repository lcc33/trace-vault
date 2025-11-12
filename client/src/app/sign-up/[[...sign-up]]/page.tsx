// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        // routing="path"
        signInUrl="/sign-in"
        afterSignUpUrl="/home"
      />
    </div>
  );
}
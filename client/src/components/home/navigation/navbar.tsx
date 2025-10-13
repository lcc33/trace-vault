"use client";

import { Container } from "@/components";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import LogoutButton from "./logout";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const { data: session, status } = useSession();

  return (
    <header className="px-4 h-14 sticky top-0 inset-x-0 font-sans w-full bg-background/40 backdrop-blur-lg border-b border-border z-50">
      <Container reverse>
        <div className="flex items-center justify-between h-full mx-auto md:max-w-screen-xl">
          {/* Logo + Name */}
          <div className="flex items-start">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/assets/logo.jpeg"
                alt="TraceVault logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-lg font-semibold">TraceVault</span>
            </Link>
          </div>

          {/* Center Nav */}
          <nav className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ul className="flex items-center justify-center gap-8 ">
              <Link
                href="/home"
                className="hover:text-foreground/80 text-sm font-semibold font-sans"
              >
                Home
              </Link>
              <Link
                href="/#report"
                className="hover:text-foreground/80 text-sm font-semibold font-sans"
              >
                Notifications
              </Link>
              <Link
                href="/profile"
                className="hover:text-foreground/80 text-sm font-semibold font-sans"
              >
                Profile
              </Link>
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
};

export default Navbar;

"use client";

import { Container } from "@/components";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="px-4 h-14 sticky top-0 inset-x-0 font-sans w-full  backdrop-blur-lg border-b border-border z-50">
      <Container reverse>
        <div className="flex items-center justify-between h-full mx-auto md:max-w-screen-xl relative">
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

          {/* Hamburger for mobile */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded focus:outline-none"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Center Nav (desktop) */}
          <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
              <Link
                href="/claims"
                className="hover:text-foreground/80 text-sm font-semibold font-sans"
              >
                Claims
              </Link>
            </ul>
          </div>

          {/* Right Side: Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <Link
                href="#"
                className={buttonVariants({ variant: "outline" })}
                onClick={async (e) => {
                  e.preventDefault();
                  const { signOut } = await import("next-auth/react");
                  signOut({ callbackUrl: "/" });
                }}
              >
                Sign out
              </Link>
            ) : (
              <Link
                href="/login"
                className={buttonVariants({ variant: "default" })}
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden absolute top-14 left-0 w-full bg-background/95 shadow-lg z-50 ">
              <ul className="flex flex-col items-center gap-4 py-4">
                <Link
                  href="/home"
                  className="w-full text-center py-2 hover:bg-foreground/10"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/#report"
                  className="w-full text-center py-2 hover:bg-foreground/10"
                  onClick={() => setMenuOpen(false)}
                >
                  Notifications
                </Link>
                <Link
                  href="/profile"
                  className="w-full text-center py-2 hover:bg-foreground/10"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/claims"
                  className="w-full text-center py-2 hover:bg-foreground/10"
                  onClick={() => setMenuOpen(false)}
                >
                  Claims
                </Link>
                <div className="w-full flex flex-col items-center gap-2 mt-2">
                  {session ? (
                    <Link
                      href="#"
                      className={buttonVariants({ variant: "outline" })}
                      onClick={async (e) => {
                        e.preventDefault();
                        const { signOut } = await import("next-auth/react");
                        signOut({ callbackUrl: "/" });
                        setMenuOpen(false);
                      }}
                    >
                      Sign out
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className={buttonVariants({ variant: "default" })}
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </ul>
            </div>
          )}
        </div>
      </Container>
    </header>
  );
};

export default Navbar;

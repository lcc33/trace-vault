// src/components/home/navigation/Navbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaFileAlt, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

const Navbar = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: "home", href: "/home", icon: FaHome, label: "Home" },
    { id: "explore", href: "/explore", icon: FaSearch, label: "Explore" },
    { id: "claims", href: "/claims", icon: FaFileAlt, label: "Claims" },
    {
      id: "settings",
      href: "/settings",
      icon: IoSettingsSharp,
      label: "Settings",
    },
  ];

  const webUrl = process.env.TRACEVAULT_WEB_URL || "/";

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    setSidebarOpen(false);
  };

  const defaultAvatar =
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Update active nav item based on pathname
  useEffect(() => {
    if (!pathname) return;

    if (pathname === "/" || pathname.startsWith("/home")) {
      setActiveItem("home");
    } else if (pathname.startsWith("/claims")) {
      setActiveItem("claims");
    } else if (pathname.startsWith("/profile")) {
      setActiveItem("profile");
    } else if (pathname.startsWith("/settings")) {
      setActiveItem("settings");
    } else if (pathname.startsWith("/explore")) {
      setActiveItem("explore");
    }
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse" />
      </div>
    );
  }

  const userImageUrl = user?.imageUrl || defaultAvatar;
  const userName = user?.fullName || user?.firstName || "User";

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <header className="lg:hidden sticky top-0 left-0 right-0 z-40 bg-transparent border-none">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Image
              src={userImageUrl}
              alt="Profile"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = defaultAvatar;
              }}
            />
          </button>
          <div className="w-8" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Sidebar Overlay - Mobile only */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-700 z-50 transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 w-[280px] lg:w-[88px] xl:w-[275px]`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-slate-700 lg:justify-center">
            <Link
              href={webUrl}
              className="flex gap-3 justify-between xl:justify-start"
              onClick={() => handleItemClick("home")}
            >
              <Image
                src="/assets/logo.jpeg"
                alt="TraceVault"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg flex-shrink-0"
                priority
              />
            </Link>

            {/* Close button - Mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 -mr-2 rounded-full hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <FaTimes className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200 group
                    lg:justify-center xl:justify-start
                    ${
                      isActive
                        ? "bg-sky-500/10 text-sky-400 font-bold"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <span className="text-xl lg:hidden md:hidden xl:block">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-3 border-t border-slate-700">
            <Link
              href="/profile"
              onClick={() => handleItemClick("profile")}
              className="flex items-center gap-3 p-3 rounded-full hover:bg-slate-800 transition-colors lg:justify-center xl:justify-start"
            >
              <div className="relative flex-shrink-0">
                <Image
                  src={userImageUrl}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatar;
                  }}
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-slate-900" />
              </div>

              <div className="flex-1 min-w-0 lg:hidden xl:block">
                <p className="text-sm font-bold text-white truncate">
                  {userName}
                </p>
              </div>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className="w-full mt-3 py-3 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all
                lg:justify-center xl:justify-start flex items-center gap-2"
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="lg:hidden xl:block">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;

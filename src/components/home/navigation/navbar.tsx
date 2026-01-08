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
 const webUrl = process.env.TRACEVAULT_WEB_URL;
  const handleItemClick = (id: string) => {
    setActiveItem(id);
    setSidebarOpen(false); // Close on mobile
  };

  const defaultAvatar =
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  // Close sidebar on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 868) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update active nav item when the pathname changes
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

    // keep sidebar state unchanged here; clicking nav items will close on mobile
  }, [pathname]);

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
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-700 z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo + Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <Link
              href={`${webUrl}`}
              className="flex items-center gap-3"
              onClick={() => handleItemClick("home")}
            >
              <Image
                src="/assets/logo.jpeg"
                alt="TraceVault"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg"
                priority
              />
              <span className="text-xl font-bold text-white">TraceVault</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-sky-500/10 text-sky-400 font-medium"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile + Sign Out */}
          <div className="p-4 border-t border-slate-700">
            <div className="space-y-4">
              <Link
                href="/profile"
                onClick={() => handleItemClick("profile")}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="relative">
                  <Image
                    src={userImageUrl}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-600"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-slate-900"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-slate-400">View Profile</p>
                </div>
              </Link>

              {/* Sign Out Button */}
              {user && (
                <button
                  onClick={() => signOut({ redirectUrl: "/sign-in" })}
                  className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Sign Out
                </button>
              )}
              {!user && (
                <button
                  onClick={() => router.push("/sign-in")}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Topbar (visible on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => handleItemClick("home")}
          >
            <Image
              src="/assets/logo.jpeg"
              alt="TraceVault"
              width={32}
              height={32}
              className="w-8 h-8 rounded-md"
              priority
            />
            <span className="text-lg font-bold text-white">TraceVault</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white"
            >
              <FaBars className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Offset: add top padding on mobile to account for fixed topbar */}
      <div className="pt-14 md:pt-0 md:pl-64">
        {/* Your page content goes here */}
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;

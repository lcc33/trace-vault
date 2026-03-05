"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaFileAlt, FaSearch } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

const Navbar = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // For desktop hover
  const [isMobile, setIsMobile] = useState();
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

  const webUrl = process.env.NEXT_PUBLIC_TRACEVAULT_WEB_URL || "/";

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    setSidebarOpen(false);
  };

  const defaultAvatar =
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

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
      <header className="lg:hidden sticky top-0 left-0 right-0 z-40 ">
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
          <Link
            href="/home"
            className="absolute hidden lg:flex left-1/2 -translate-x-1/2"
          >
            <Image
              src="/assets/logo.jpeg"
              alt="TraceVault"
              width={32}
              height={32}
              className="w-8 h-8 rounded-md"
              priority
            />
          </Link>
          <div className="w-8" />
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
     
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
     
        
        className={`

    fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-700 z-50 
    transition-all duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 
    ${isHovered ? "lg:w-[275px]" : "lg:w-[88px]"}
    w-[280px]
  `}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;

              const active = pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
              flex items-center gap-4 px-4 py-3 rounded-xl 
              transition-all duration-200 group relative
              ${
                active
                  ? "bg-sky-500/10 text-sky-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }
            `}
                >
                  <Icon
                    className={`w-6 h-6 flex-shrink-0 ${active ? "text-sky-400" : ""}`}
                  />

                  <span
                    className={`
              text-lg font-medium whitespace-nowrap transition-all duration-300
              opacity-100 translate-x-0
              ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 lg:hidden"}
            `}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-700 overflow-hidden">
            <Link
              href="/profile"
              onClick={() => handleItemClick("profile")}
              className="flex items-center gap-3 p-3 rounded-full hover:bg-slate-800 transition-colors relative group"
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

              <div
                className={`
                  flex-1 min-w-0
                  transition-opacity duration-300
                  ${isHovered ? "lg:opacity-100" : "lg:opacity-0 lg:hidden"}
                `}
              >
                <p className="text-sm font-bold text-white truncate">
                  {userName}
                </p>
              </div>

              {!isHovered && (
                <div className="hidden lg:group-hover:block absolute left-full ml-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl whitespace-nowrap z-50">
                  <p className="text-sm font-bold text-white">{userName}</p>
                  <p className="text-xs text-slate-400">View Profile</p>
                </div>
              )}
            </Link>

            <button
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className={`
                w-full mt-3 py-3 px-4 rounded-full 
                bg-red-600 hover:bg-red-700 text-white font-bold 
                transition-all flex items-center gap-2 relative group
                ${isHovered ? "lg:justify-start" : "lg:justify-center"}
              `}
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

              <span
                className={`
                  whitespace-nowrap
                  transition-opacity duration-300
                  ${isHovered ? "lg:opacity-100" : "lg:opacity-0 lg:hidden"}
                `}
              >
                Sign Out
              </span>

              {!isHovered && (
                <div className="hidden lg:group-hover:block absolute left-full ml-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl whitespace-nowrap z-50">
                  <span className="text-sm text-white">Sign Out</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`
          hidden lg:block fixed top-0 left-0 h-full pointer-events-none
          transition-all duration-300
          ${isHovered ? "w-[275px]" : "w-[88px]"}
        `}
      />
    </>
  );
};

export default Navbar;

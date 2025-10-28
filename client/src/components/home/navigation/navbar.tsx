"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  FaHome,
  FaBell,
  FaUser,
  FaFileAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [activeItem, setActiveItem] = useState("home");

  // TraceVault-specific navigation items
  const navItems = [
    { id: "home", href: "/home", icon: FaHome, label: "Home" },
    {
      id: "notifications",
      href: "/notifications",
      icon: FaBell,
      label: "Notifications",
      hasNotification: true,
    },
    //{ id: "profile", href: "/profile", icon: FaUser, label: "Profile" },
    { id: "claims", href: "/claims", icon: FaFileAlt, label: "Claims" },
  ];

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  const userImageUrl = session?.user?.image || "/default-avatar.png";

  return (
    <header className="px-4 h-14 sticky bg-slate-900 top-0 inset-x-0 font-sans w-full  backdrop-blur-lg border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setActiveItem("home")}
            >
              <Image
                src="/assets/logo.jpeg"
                alt="TraceVault logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded"
              />
              <span className="text-xl font-bold text-white hidden sm:block">
                TraceVault
              </span>
            </Link>
          </div>

          {/* Primary Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-slate-800 text-sky-400 font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>

                  {/* Notification Badge */}
                  {item.id === "notifications" && item.hasNotification && (
                    <span className="sr-only">Notifications</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section - Actions & User */}
          <div className="flex items-center space-x-3">
            {/* Utility Icons */}
            <Link
              href="/settings"
              className="text-slate-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-slate-800"
            >
              <IoSettingsSharp className="w-5 h-5" />
            </Link>

            <Link
              href="/help"
              className="text-slate-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-slate-800"
            >
              <FaQuestionCircle className="w-5 h-5" />
            </Link>

            {/* User Profile */}
            {session ? (
              <div className="relative">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="relative">
                    <Image
                      src={userImageUrl}
                      alt="User Profile"
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover border-2 border-slate-600"
                    />
                    {/* Online Status */}
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-slate-900 bg-green-400"></span>
                  </div>
                  <span className="text-slate-300 text-sm hidden lg:block max-w-24 truncate">
                    {session.user?.name}
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-40 py-2">
          <div className="flex items-center justify-around">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-lg transition-colors
                    ${
                      isActive
                        ? "text-sky-400"
                        : "text-slate-400 hover:text-white"
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

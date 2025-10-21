"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { 
  FaHome, 
  FaBell, 
  FaUser, 
  FaFileAlt, 
  FaSignOutAlt, 
  FaSignInAlt,
  FaCog
} from 'react-icons/fa';

const Sidebar = () => {
  const { data: session, status } = useSession();
  const [activeItem, setActiveItem] = useState("home");

  const navItems = [
    { id: "home", href: "/home", icon: FaHome, label: "Home" },
    { id: "notifications", href: "/notifications", icon: FaBell, label: "Notifications" },
    { id: "profile", href: "/profile", icon: FaUser, label: "Profile" },
    { id: "claims", href: "/claims", icon: FaFileAlt, label: "Claims" },
    { id: "settings", href: "/settings", icon: FaCog, label: "Settings" },
  ];

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  return (
    <>
      {/* Desktop Sidebar (like X) */}
      <aside className="hidden md:flex flex-col items-start xl:items-start h-screen sticky top-0 px-4 xl:px-8 py-3">
        {/* Logo */}
        <div className="mb-4 xl:mb-8">
          <Link 
            href="/" 
            className="flex items-center justify-center xl:justify-start p-3 rounded-full hover:bg-slate-800 transition-colors duration-200"
          >
            <Image
              src="/assets/logo.jpeg"
              alt="TraceVault logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 w-full">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <li key={item.id} className="w-full">
                  <Link
                    href={item.href}
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      flex items-center justify-center xl:justify-start gap-4 
                      p-3 rounded-full transition-colors duration-200
                      group w-full
                      ${isActive 
                        ? 'text-white font-semibold' 
                        : 'text-slate-300 hover:text-white'
                      }
                      ${isActive 
                        ? 'hover:bg-slate-800' 
                        : 'hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                    <span className="hidden xl:block text-xl">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>


        {/* User Profile / Auth Section */}
        <div className="mt-auto w-full py-4">
          {session ? (
            <div className="flex items-center justify-between gap-3 px-3">
              
              {/* Mobile profile icon */}
              <div className="xl:hidden">
                <Image
                  src={session.user?.image || "/default-avatar.png"}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              </div>

              {/* Sign out dropdown trigger */}
              <div className="hidden xl:block">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    const { signOut } = await import("next-auth/react");
                    signOut({ callbackUrl: "/" });
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  •••
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className={`
                flex items-center justify-center xl:justify-start gap-3
                p-3 rounded-full transition-colors duration-200
                bg-slate-800 hover:bg-slate-700 text-white
                ${buttonVariants({ variant: "default" })}
              `}
            >
              <FaSignInAlt className="w-5 h-5" />
              <span className="hidden xl:block">Sign in</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation (like X mobile app) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => handleItemClick(item.id)}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-lg
                  transition-colors duration-200
                  ${isActive 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-sky-500' : ''}`} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
          
        
        </div>
      </nav>

      {/* Add padding to main content for mobile bottom nav */}
      <style jsx global>{`
        @media (max-width: 768px) {
          main {
            padding-bottom: 80px;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
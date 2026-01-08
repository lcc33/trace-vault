import {
  FaHome,
  FaFileAlt,
  FaInfo,
  FaArrowRight,
  FaClock,
  FaGithub,
  FaMoon,
  FaTimes,
  FaBars,
} from "react-icons/fa";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: "intro", href: "/docs/intro", icon: FaHome, label: "Intro" },
    { id: "about", href: "/docs/about", icon: FaInfo, label: "About" },
    {
      id: "get-started",
      href: "/docs/getting-started",
      icon: FaArrowRight,
      label: "Getting Started",
    },
    { id: "usage", href: "/docs/usage", icon: FaClock, label: "Usage" },
    {
      id: "github-issues",
      href: "/docs/github-issues",
      icon: FaFileAlt,
      label: "Github Issues",
    },
  ];

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    setSidebarOpen(false); // Close on mobile
  };

  useEffect(() => {
    if (!pathname) return;

    if (pathname === "/docs") {
      return;
    } else if (pathname.startsWith("/intro")) {
    } else if (pathname.startsWith("/about")) {
      setActiveItem("about");
    } else if (pathname.startsWith("/getting-started")) {
      setActiveItem("get-started");
    } else if (pathname.startsWith("/usage")) {
      setActiveItem("usage");
    } else if (pathname.startsWith("/github-issues")) {
      setActiveItem("github-issues");
    }
  }, [pathname]);

  const ChangeTheme = () => {
    console.log("theme has changed!!");
  };
    useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-700 z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo + Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <Link
              href="/docs"
              className="flex items-center gap-3"
              
            >
              <span className="text-xl font-bold sm:hidden md:flex lg:flex text-white">
                TraceVault Docs
              </span>
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
        </div>
      </aside>
      {/*mobile*/}
      <div className="md:hidden fixed top-0 lg:h-full left-0 right-0 z-50 bg-slate-900 border-b border-slate-700 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => handleItemClick("home")}
          >
            <span className="text-lg font-bold text-white">
              TraceVault Docs
            </span>
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
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

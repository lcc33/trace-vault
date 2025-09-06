import { Container, Icons } from "@/components";
import Image from "next/image";
// import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="px-4 h-14 sticky top-0 inset-x-0 w-full bg-background/40 backdrop-blur-lg border-b border-border z-50">
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
              <span className="text-lg font-semibold">
                TraceVault
              </span>
            </Link>
          </div>

          {/* Center Nav */}
          {/* <nav className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ul className="flex items-center justify-center gap-8">
              <Link href="/#explore" className="hover:text-foreground/80 text-sm">Explore</Link>
              <Link href="/#report" className="hover:text-foreground/80 text-sm">Report</Link>
              <Link href="/about" className="hover:text-foreground/80 text-sm">About</Link>
              <Link href="/blog" className="hover:text-foreground/80 text-sm">Blog</Link>
            </ul>
          </nav> */}

          {/* Right Side Actions */}
          {/* <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className={buttonVariants({ size: "sm", variant: "ghost" })}
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className={buttonVariants({ size: "sm", className: "hidden md:flex" })}
            >
              Get Started
            </Link>
          </div> */}
        </div>
      </Container>
    </header>
  )
};

export default Navbar;

import { SITE_CONFIG } from "@/config";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeProvider from "@/components/providers/theme-provider";
import { startCleanupJob } from "@/lib/cleanup-job";

// Initialize cleanup job on server startup
if (process.env.NODE_ENV === "production") {
  startCleanupJob();
}

export const metadata = SITE_CONFIG;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
          />
          <meta name="theme-color" content="#020617" />
        </head>
        <body
          className={cn(
            "min-h-screen bg-background text-foreground font-sans antialiased selection:bg-cyan-500/30",
            "max-w-full overflow-x-hidden scroll-smooth",
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              {children}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

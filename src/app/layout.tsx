import { SITE_CONFIG } from "@/config";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
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
        <body
          className={cn(
            "min-h-screen bg-background text-foreground font-sans antialiased max-w-full overflow-x-hidden"
          )}
        >
          <div
            style={{
              margin: "0",
              padding: "0",
              boxSizing: "border-box",
            }}
          >
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
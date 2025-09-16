import { SITE_CONFIG } from "@/config";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = SITE_CONFIG;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground font-sans antialiased max-w-full overflow-x-hidden"
        )}
       
      >
        <ClerkProvider>
          <div
            style={{
              width: "100%",
              minHeight: "100vh",
              margin: "0 auto",
              padding: "0 1rem",
              boxSizing: "border-box",
              display: "flex",
              
            }}
          >
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
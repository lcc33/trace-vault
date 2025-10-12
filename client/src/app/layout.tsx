import { SITE_CONFIG } from "@/config";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";


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
  );
}

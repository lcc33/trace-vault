import { Navbar } from "@/components";

export default function DynamicReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="relative flex min-h-screen flex-col">
        {children}
      </main>
    </>
  );
}
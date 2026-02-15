import { Metadata } from "next";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import ReportDetailClient from "./ReportDetailClient";

interface IReport {
  _id: string;
  itemName?: string;
  category: string;
  location?: string;
  description: string;
  imageUrl?: string;
  status: "lost" | "found" | "claimed";
  reporterId: string;
  createdAt: string;
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return { title: "Not Found" };

  await dbConnect;

  const Report =
    mongoose.models.Report || mongoose.model("Report", new mongoose.Schema({}));

  const report = (await Report.findById(id).lean()) as IReport | null;

  if (!report) return { title: "Item Not Found | TraceVault" };

  const title = `${report.status === "found" ? "Found" : "Lost"}: ${report.itemName || report.category}`;
  return {
    title: `${title} | TraceVault`,
    description: report.description,
    openGraph: {
      title,
      description: report.description,
      images: [report.imageUrl || "/assets/og-image.png"],
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  await dbConnect;
  const Report = mongoose.models.Report || mongoose.model("Report");
  const report = (await Report.findById(id).lean()) as IReport | null;

  if (!report) notFound();

  const serializedReport = JSON.parse(JSON.stringify(report));

  return <ReportDetailClient initialReport={serializedReport} />;
}

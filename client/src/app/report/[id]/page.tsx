// src/app/report/[id]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { Metadata } from "next";

interface Report {
  _id: string;
  reporterId: string;
  description: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
  user: {
    name?: string;
    email?: string;
    profilePic?: string;
  };
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;
  return {
    title: `Report #${id} – TraceVault`,
    description: "View lost or found item report",
  };
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ← UNWRAP PROMISE
  const clerkUser = await currentUser();

  let report: Report | null = null;

  try {
    const client = await clientPromise;
    const db = client.db("tracevault");

    // Use string _id — no ObjectId
    const doc = await db.collection<Report>("reports").findOne({ _id: id });

    if (!doc) notFound();

    report = {
      _id: doc._id,
      reporterId: doc.reporterId,
      description: doc.description,
      category: doc.category,
      imageUrl: doc.imageUrl,
      createdAt: new Date(doc.createdAt).toISOString(),
      user: doc.user,
    };
  } catch (err) {
    console.error("Failed to fetch report:", err);
    notFound();
  }

  const isOwner = clerkUser?.id === report.reporterId;
  const defaultAvatar = "/default-avatar.png";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-2xl mx-auto p-4">
        {/* Report Card */}
        <div className="bg-slate-800/40 border border-white/10 rounded-2xl shadow-lg p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={report.user?.profilePic || defaultAvatar}
              alt="User"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover border border-white/10"
            />
            <div>
              <p className="font-semibold text-slate-100">
                {report.user?.name || "Anonymous"}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(report.createdAt).toLocaleDateString()} • {report.category}
              </p>
            </div>
          </div>

          <p className="text-slate-200 leading-relaxed mb-4">{report.description}</p>

          {report.imageUrl && (
            <div className="mb-6 w-full aspect-video relative overflow-hidden rounded-xl border border-slate-700">
              <Image
                src={report.imageUrl}
                alt="Report image"
                fill
                className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
                unoptimized
                sizes="(max-width: 600px) 100vw, 600px"
                onClick={() => {
                  const modal = document.getElementById("image-modal");
                  if (modal) modal.style.display = "flex";
                }}
              />
            </div>
          )}

          <p className="text-xs text-slate-500">Report ID: {report._id}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            Back to Feed
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied!");
            }}
            className="px-4 py-2 text-sm rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
          >
            Share Report
          </button>
          {!isOwner && (
            <button
              onClick={() => {
                const modal = document.getElementById("claim-modal");
                if (modal) modal.style.display = "flex";
              }}
              className="px-4 py-2 text-sm rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
            >
              Claim Item
            </button>
          )}
        </div>
      </div>

      {/* Enlarged Image Modal */}
      <div
        id="image-modal"
        className="hidden fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          const target = e.currentTarget as HTMLElement;
          target.style.display = "none";
        }}
      >
        <div className="relative max-w-4xl max-h-full">
          <Image
            src={report.imageUrl!}
            alt="Enlarged"
            width={1200}
            height={800}
            className="rounded-lg object-contain max-w-full max-h-[90vh]"
            unoptimized
          />
          <button
            className="absolute -top-12 right-0 text-white text-lg bg-slate-800/50 hover:bg-slate-700/50 w-8 h-8 rounded-full flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              const modal = document.getElementById("image-modal");
              if (modal) modal.style.display = "none";
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Claim Modal */}
      <div
        id="claim-modal"
        className="hidden fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          const target = e.currentTarget as HTMLElement;
          target.style.display = "none";
        }}
      >
        <div
          className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-semibold mb-4 text-white">Claim Item</h2>

          <textarea
            placeholder="Describe how you lost this item..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 mb-3 focus:border-sky-500 outline-none resize-none min-h-[100px]"
            id="claim-description"
          />

          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">
              Upload proof image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              id="claim-image"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-sky-500 outline-none"
            />
            <div id="claim-preview" className="mt-2 hidden">
              <Image
                id="preview-img"
                src=""
                alt="Preview"
                width={150}
                height={100}
                className="max-h-32 rounded-lg border border-slate-700 object-cover"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                const modal = document.getElementById("claim-modal");
                if (modal) modal.style.display = "none";
              }}
              className="px-4 py-2 text-sm rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                const desc = (document.getElementById("claim-description") as HTMLTextAreaElement)?.value.trim();
                const fileInput = document.getElementById("claim-image") as HTMLInputElement;
                const file = fileInput.files?.[0];

                if (!desc) {
                  alert("Please provide a description");
                  return;
                }

                const formData = new FormData();
                formData.append("reportId", id);
                formData.append("description", desc);
                if (file) formData.append("image", file);

                try {
                  const res = await fetch("/api/claims", {
                    method: "POST",
                    body: formData,
                  });
                  const data = await res.json();

                  if (res.ok) {
                    alert("Claim submitted!");
                    const modal = document.getElementById("claim-modal");
                    if (modal) modal.style.display = "none";
                  } else {
                    alert(data.error || "Failed");
                  }
                } catch {
                  alert("Network error");
                }
              }}
              className="px-4 py-2 text-sm rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
            >
              Submit Claim
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const input = document.getElementById('claim-image');
            if (input) {
              input.addEventListener('change', function(e) {
                const file = e.target.files?.[0];
                const preview = document.getElementById('claim-preview');
                const img = document.getElementById('preview-img');
                if (file && preview && img) {
                  img.src = URL.createObjectURL(file);
                  preview.classList.remove('hidden');
                } else if (preview) {
                  preview.classList.add('hidden');
                }
              });
            }
          `,
        }}
      />
    </div>
  );
}
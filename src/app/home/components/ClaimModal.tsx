// src/app/home/components/ClaimModal.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reportId: string | null;
  onSuccess: () => void;
  showToast: (msg: string, success?: boolean) => void;
}

export default function ClaimModal({
  isOpen,
  onClose,
  reportId,
  onSuccess,
  showToast,
}: Props) {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !reportId) return null;

  const handleSubmit = async () => {
    if (!description.trim()) return showToast("Add a description", false);
    if (!image) return showToast("Upload proof image", false);

    setLoading(true);
    const formData = new FormData();
    formData.append("reportId", reportId);
    formData.append("description", description);
    formData.append("image", image);

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        onClose();
        setDescription("");
        setImage(null);
        onSuccess();
        
        alert("Claim submitted! The Reporter will contact you.");
      } else {
        showToast(data.error || "Claim failed", false);
      }
    } catch {
      showToast("Network error", false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 rounded-3xl p-6 w-full max-w-lg border border-slate-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Claim This Item</h2>

        <textarea
          placeholder="Describe how this item belongs to you..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 min-h-32 resize-none mb-5"
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-3">
            Proof of Ownership (Photo)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
          />
          {image && (
            <div className="mt-4">
              <Image
                src={URL.createObjectURL(image)}
                alt="Proof preview"
                width={400}
                height={300}
                className="rounded-2xl border border-slate-700 object-cover w-full max-h-64"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" />}
            Submit Claim
          </button>
        </div>
      </div>
    </div>
  );
}

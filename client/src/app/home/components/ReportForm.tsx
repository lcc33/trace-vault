// src/app/home/components/ReportForm.tsx
"use client";

import { useRef, useState } from "react";
import { FaImage, FaTimes, FaPhone } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ReportForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoaded) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Image too large (max 8MB)");
      return;
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user) {
      setError("Sign in required");
      setLoading(false);
      return;
    }

    const description = descriptionRef.current?.value.trim();
    const category = categoryRef.current?.value;
    const whatsapp = whatsappRef.current?.value.replace(/[^0-9+]/g, "");

    if (!description || !category || !whatsapp) {
      setError("All fields required");
      setLoading(false);
      return;
    }

    if (description.length < 10) {
      setError("Description too short");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("category", category);
    formData.append("whatsappNumber", whatsapp);
    if (fileInputRef.current?.files?.[0]) {
      formData.append("image", fileInputRef.current.files[0]);
    }

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
        // ensure cookies (Clerk session) are sent
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Report POST failed:", res.status, data);
        setError(data.error || "Failed to post");
      } else {
        descriptionRef.current!.value = "";
        categoryRef.current!.value = "";
        whatsappRef.current!.value = "";
        removeImage();
        onSuccess();
        router.push("/home");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            ref={descriptionRef}
            placeholder="Describe the item..."
            className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 min-h-36 resize-none"
            required
            maxLength={1000}
          />

          <div className="relative">
            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400" />
            <input
              ref={whatsappRef}
              type="tel"
              placeholder="WhatsApp number (e.g. +234...)"
              className="w-full pl-12 py-4 bg-slate-800/60 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-sky-500/50">
              <Image
                src={imagePreview}
                alt="Preview"
                width={800}
                height={600}
                className="w-full h-64 object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 bg-red-600 p-2.5 rounded-full"
              >
                <FaTimes className="text-white" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700">
            <div className="flex flex-wrap gap-3 items-center">
              <select
                ref={categoryRef}
                required
                className="bg-slate-800 border border-slate-600 text-sky-400 rounded-full px-6 py-3 focus:outline-none focus:border-sky-500"
              >
                <option value="" disabled>
                  Select Category
                </option>
                <option value="electronics">Electronics</option>
                <option value="documents">Documents/ID</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Wallet/Jewelry</option>
                <option value="bags">Bag/Backpack</option>
                <option value="keys">Keys</option>
                <option value="other">Other</option>
              </select>

              <label className="cursor-pointer flex items-center gap-3 bg-slate-800 border border-slate-600 hover:border-sky-500 rounded-full px-6 py-3 text-sky-400">
                <FaImage className="w-5 h-5" />
                <span>{imagePreview ? "Change Photo" : "Add Photo"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !user}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-4 px-10 rounded-full flex items-center justify-center gap-3 shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" /> : null}
              Post Report
            </button>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-400 px-6 py-4 rounded-2xl text-center font-medium">
              {error}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

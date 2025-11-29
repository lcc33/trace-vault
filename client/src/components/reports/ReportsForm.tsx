// src/components/reports/ReportForm.tsx
"use client";

import { useRef, useState } from "react";
import { FaImage, FaTimes, FaPhone } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ReportForm() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoaded) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8MB");
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user) {
      setError("You must be signed in to post a report");
      setLoading(false);
      return;
    }

    const description = descriptionRef.current?.value.trim();
    const category = categoryRef.current?.value;
    const whatsappNumber = whatsappRef.current?.value.replace(/[^0-9+]/g, ""); // Clean number
    

    if (!description || !category || !whatsappNumber ) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (description.length < 10) {
      setError("Description must be at least 10 characters");
      setLoading(false);
      return;
    }

    if (whatsappNumber.length < 10) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("category", category);
    formData.append("whatsappNumber", whatsappNumber); // ← Critical: matches API
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // Reset form
        descriptionRef.current!.value = "";
        categoryRef.current!.value = "";
        whatsappRef.current!.value = "";
        removeImage();

        window.dispatchEvent(new CustomEvent("reports:refresh"));
        router.push("/home");
      } else {
        setError(data.error || "Failed to post report");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <textarea
              ref={descriptionRef}
              placeholder="Describe the item (location, color, brand, serial number, etc.)"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-1 text-base text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition-all min-h-16"
              required
              maxLength={1000}
              rows={5}
            />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>{descriptionRef.current?.value.length || 0}/1000</span>
            </div>
          </div>

          {/* WhatsApp Number */}
          <div>
            <div className="relative">
              <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400" />
              <input
                ref={whatsappRef}
                type="tel"
                placeholder="Your WhatsApp number (e.g. +2348012345678)"
                className="w-full pl-12 pr-4 py-4 bg-slate-800/60 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition"
                required
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Required so the claimant can contact you directly
            </p>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-sky-500/50 bg-slate-800/50">
              <Image
                src={imagePreview}
                alt="Item preview"
                width={800}
                height={600}
                className="w-full h-64 object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-full backdrop-blur-sm transition shadow-lg"
                aria-label="Remove image"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Category + Image Upload */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700">
            <div className="flex flex-wrap items-center gap-3">
              <select
                ref={categoryRef}
                required
                className="bg-slate-800 border border-slate-600 text-sky-400 rounded-full px-6 py-3 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition"
                defaultValue=""
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

              <label className="cursor-pointer inline-flex items-center gap-3 bg-slate-800 border border-slate-600 hover:border-sky-500 rounded-full px-6 py-3 text-sm font-medium text-sky-400 transition hover:bg-sky-500/10">
                <FaImage className="w-5 h-5" />
                <span>{image ? "Change Photo" : "Add Photo (Required)"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading || !user}
                  required={true}
                />
              </label>

              {image && (
                <span className="text-xs bg-sky-500/10 text-sky-400 px-3 py-1.5 rounded-full truncate max-w-[140px]">
                  {image.name}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !user}
              className="w-full sm:w-auto bg-sky-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Report"
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-400 px-6 py-4 rounded-2xl text-sm font-medium animate-pulse text-center">
              {error}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

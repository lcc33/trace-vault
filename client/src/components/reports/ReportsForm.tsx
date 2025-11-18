// src/components/reports/ReportForm.tsx
"use client";

import { useRef, useState } from "react";
import { FaImage, FaTimes } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ReportForm() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wait for Clerk
  if (!isLoaded) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
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
    if (descriptionRef.current?.form) {
      const input = descriptionRef.current.form.elements.namedItem("image") as HTMLInputElement;
      if (input) input.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user) {
      setError("You must be signed in to post");
      setLoading(false);
      return;
    }

    const description = descriptionRef.current?.value.trim();
    const category = categoryRef.current?.value;

    if (!description || !category) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (description.length < 10) {
      setError("Description must be at least 10 characters");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("category", category);
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
        removeImage();

        // Trigger refresh in feed
        window.dispatchEvent(new CustomEvent("reports:refresh"));

        router.push("/home");
      } else {
        setError(data.error || "Failed to post report");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Description */}
          <div>
            <textarea
              ref={descriptionRef}
              placeholder="Describe the item you found/lost... (location, color, brand, etc.)"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-base text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition-all min-h-32"
              required
              maxLength={1000}
              rows={4}
            />
            <p className="text-xs text-slate-500 mt-2 text-right">
              {descriptionRef.current?.value.length || 0}/1000
            </p>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-sky-500/50 bg-slate-800/50">
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
                className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-full backdrop-blur-sm transition"
                aria-label="Remove image"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-700">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Category */}
              <select
                ref={categoryRef}
                required
                className="bg-slate-800 border border-slate-600 text-sky-400 rounded-full px-5 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 transition"
                defaultValue=""
              >
                <option value="" disabled>
                  Choose Category
                </option>
                <option value="electronics">Electronics</option>
                <option value="documents">Documents/ID</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Wallet/Jewelry</option>
                <option value="bags">Bag/Backpack</option>
                <option value="keys">Keys</option>
                <option value="other">Other</option>
              </select>

              {/* Image Upload */}
              <label className="cursor-pointer flex items-center gap-2 bg-slate-800 border border-slate-600 hover:border-sky-500 rounded-full px-5 py-2.5 text-sm font-medium text-sky-400 transition hover:bg-sky-500/10">
                <FaImage className="w-5 h-5" />
                <span className="hidden sm:inline">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>

              {/* Image Name (mobile only) */}
              {image && (
                <span className="text-xs text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-full truncate max-w-[140px]">
                  {image.name}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !user}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-8 rounded-full transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Report"
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 px-5 py-3 rounded-xl text-sm font-medium animate-pulse">
              {error}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
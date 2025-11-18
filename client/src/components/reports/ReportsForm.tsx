// src/components/reports/ReportsForm.tsx
"use client";

import { useRef, useState } from "react";
import { FaImage, FaSpinner } from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function ReportForm() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const categoryRef = useRef<HTMLSelectElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show nothing until Clerk is loaded
  if (!isLoaded) return null;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setSelectedImageName(file.name);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // --- 1. Auth Check ---
    if (!user) {
      setError("Please sign in to create a report");
      setLoading(false);
      return;
    }

    // --- 2. Get Form Values ---

    const description = descriptionRef.current?.value.trim();

    const category = categoryRef.current?.value;

    if (!description || !category) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (description.length < 5) {
      setError("Description must be at least 5 characters");
      setLoading(false);
      return;
    }

    // --- 3. Build FormData ---
    const formData = new FormData();

    formData.append("description", description);

    formData.append("category", category);
    if (file) formData.append("image", file);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // --- Success: Reset + Redirect ---

        descriptionRef.current!.value = "";

        categoryRef.current!.value = "";
        imageInputRef.current!.value = "";
        setFile(null);
        setSelectedImageName(null);

        // Optional: redirect to new report or refresh feed
        // Notify any feed/listeners to refresh
        try {
          window.dispatchEvent(new CustomEvent("reports:refresh"));
        } catch (e) {
          /* ignore in non-browser envs */
        }

        router.push("/home");
      } else {
        setError(data.error || "Failed to create report");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border-b border-slate-700 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}

        {/* Description */}
        <textarea
          ref={descriptionRef}
          placeholder="Describe the item, where you lost/found it, any unique details..."
          className="w-full bg-transparent border-none resize-none min-h-[80px] p-2 text-lg outline-none placeholder:text-slate-400"
          required
        />

        {/* Location */}

        {/* Bottom Row: Category, Image, Submit */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-700">
          <div className="flex flex-col sm:flex-row flex-1 items-center gap-3 w-full">
            {/* Category */}
            <select
              ref={categoryRef}
              required
              className="bg-transparent text-sky-500 border border-sky-500 rounded-full px-3 py-1.5 text-sm font-semibold"
              defaultValue=""
            >
              <option value="" disabled>
                Category
              </option>
              <option value="electronics">Electronics</option>
              <option value="documents">Documents</option>
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="bags">Bags</option>
              <option value="keys">Keys</option>
              <option value="other">Other</option>
            </select>

            {/* Image Upload */}
            <label
              htmlFor="itemImage"
              className="cursor-pointer p-2 rounded-full hover:bg-sky-500/10 transition"
            >
              {loading ? (
                <FaSpinner className="w-5 h-5 text-sky-500 animate-spin" />
              ) : (
                <FaImage className="w-5 h-5 text-sky-500" />
              )}
              <input
                ref={imageInputRef}
                id="itemImage"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
                disabled={loading}
              />
            </label>

            {/* Selected Image Name */}
            {selectedImageName && (
              <span className="text-sky-500 text-xs bg-sky-500/10 rounded-full px-3 py-1 truncate max-w-[120px]">
                {selectedImageName}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !user}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-6 py-2 text-sm font-bold transition"
          >
            {loading ? "Posting..." : "Post Report"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-sm mt-2 animate-pulse">{error}</p>
        )}
      </form>
    </section>
  );
}

// src/app/home/components/ReportForm.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { FaImage, FaTimes } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Loading skeleton component
export function ReportFormSkeleton() {
  return (
    <section className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="space-y-6 animate-pulse">
          {/* Textarea skeleton */}
          <div className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl h-36" />

          {/* Bottom controls skeleton */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-slate-700">
            <div className="flex flex-row gap-3">
              {/* Category skeleton */}
              <div className="bg-slate-800 border border-slate-600 rounded-full h-12 w-32" />
              {/* Image button skeleton */}
              <div className="bg-slate-800 border border-slate-600 rounded-full h-12 w-32" />
            </div>
            {/* Post button skeleton */}
            <div className="bg-slate-700 rounded-full h-12 w-full sm:w-40" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ReportForm({
  onSuccessAction,
}: {
  onSuccessAction: () => void;
}) {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 8 * 1024 * 1024) {
      setError("Image too large (max 8MB)");
      return;
    }
    
    setError(null);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setDescription(text);
    setCharCount(text.length);
    setError(null);
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

    if (!description || !category) {
      setError("All fields required");
      setLoading(false);
      return;
    }

    if (description.length < 20) {
      setError("Description too short (min 20 characters)");
      setLoading(false);
      return;
    }

    if (!fileInputRef.current?.files?.[0]) {
      setError("Please add an image");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("category", category);
    formData.append("image", fileInputRef.current.files[0]);

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
        setDescription("");
        setCharCount(0);
        removeImage();
        onSuccessAction();
        
        // Show success briefly
        setError(null);
      } else {
        const errorMsg = data.error || "Failed to post report";
        if (res.status === 429) {
          setError("Daily limit reached (3 posts/day). Try again tomorrow.");
        } else {
          setError(errorMsg);
        }
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show skeleton while auth is loading
  if (!isLoaded) {
    return <ReportFormSkeleton />;
  }

  const canSubmit = description.length >= 20 && !loading;
  const charLimitReached = charCount >= 280;

  return (
    <section className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="space-y-4">
          {/* Textarea with character counter */}
          <div className="relative">
            <textarea
              ref={descriptionRef}
              onChange={handleDescriptionChange}
              placeholder="Describe the item (location, color, brand, etc.)..."
              className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition min-h-[120px] sm:min-h-[144px] resize-none text-sm sm:text-base"
              required
              maxLength={280}
            />
            
            {/* Character counter */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
              <span
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  charCount < 20
                    ? "text-slate-500"
                    : charLimitReached
                    ? "text-red-400"
                    : "text-sky-400"
                }`}
              >
                {charCount}/280
              </span>
            </div>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-sky-500/50 bg-slate-800/30">
              <Image
                src={imagePreview}
                alt="Preview"
                width={800}
                height={400}
                className="w-full h-48 sm:h-64 object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-600 hover:bg-red-700 p-2 sm:p-2.5 rounded-full transition-all shadow-lg"
                aria-label="Remove image"
              >
                <FaTimes className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-slate-700">
            <div className="flex flex-row gap-3 flex-wrap sm:flex-nowrap">
              {/* Category selector */}
              <select
                ref={categoryRef}
                required
                className="flex-1 sm:flex-none bg-slate-800 border border-slate-600 text-slate-300 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition text-sm sm:text-base min-w-[140px]"
                defaultValue=""
              >
                <option value="" disabled>
                  Category
                </option>
                <option value="electronics">📱 Electronics</option>
                <option value="documents">📄 Documents/ID</option>
                <option value="clothing">👕 Clothing</option>
                <option value="accessories">💍 Wallet/Jewelry</option>
                <option value="bags">🎒 Bag/Backpack</option>
                <option value="keys">🔑 Keys</option>
                <option value="other">📦 Other</option>
              </select>

              {/* Image upload button */}
              <label className="cursor-pointer flex items-center justify-center gap-2 bg-slate-800 border border-slate-600 hover:border-sky-500 hover:bg-slate-750 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 text-sky-400 transition-all text-sm sm:text-base whitespace-nowrap">
                <FaImage className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden sm:inline">
                  {imagePreview ? "Change" : "Add Photo"}
                </span>
                <span className="sm:hidden">
                  {imagePreview ? "Change" : "Photo"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full sm:w-auto sm:ml-auto bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-sky-600 text-white font-bold py-2.5 sm:py-3 px-8 sm:px-10 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />}
              {loading ? "Posting..." : "Post Report"}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-sm sm:text-base font-medium flex items-start gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Helper text */}
          {!error && charCount > 0 && charCount < 20 && (
            <div className="text-xs sm:text-sm text-slate-500 text-center">
              {20 - charCount} more characters needed
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
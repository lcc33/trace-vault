// src/app/home/components/ReportForm.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { FaImage, FaTimes } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
  const [loading, setLoading] = useState(false);
  const [checkingWhatsapp, setCheckingWhatsapp] = useState(true);
  const [hasWhatsapp, setHasWhatsapp] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);
  // Check if user has WhatsApp number
  useEffect(() => {
    if (isLoaded && user) {
      const checkWhatsapp = async () => {
        try {
          const res = await fetch("/api/user/status");
          if (res.ok) {
            const data = await res.json();
            setHasWhatsapp(!!data.whatsappNumber);
          } else {
            setHasWhatsapp(false);
          }
        } catch {
          setHasWhatsapp(false);
        } finally {
          setCheckingWhatsapp(false);
        }
      };
      checkWhatsapp();
    }
  }, [isLoaded, user]);

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

    if (!hasWhatsapp) {
      setError("You need a WhatsApp number to post reports");
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

    const formData = new FormData();
    formData.append("description", description);
    formData.append("category", category);
    const res = await fetch("/api/user/status");
    if (res.ok) {
      const data = await res.json();
      formData.append("reporterWhatsapp", data.whatsapp);
    }
    if (fileInputRef.current?.files?.[0]) {
      formData.append("image", fileInputRef.current.files[0]);
    }

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        descriptionRef.current!.value = "";
        categoryRef.current!.value = "";
        removeImage();
        onSuccessAction();
        router.refresh(); // Refresh to show new report
      } else {
        setError(data.error || "Failed to post report");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || checkingWhatsapp) {
    return (
      <section className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-sky-500 mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Blocked Message */}
        {!hasWhatsapp && (
          <div className="bg-orange-900/30 border border-orange-700 rounded-2xl p-6 mb-6 text-center">
            <p className="text-orange-300 text-lg mb-4">
              You need a WhatsApp number to post reports
            </p>
            <Link
              href="/profile"
              className="inline-block px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition shadow-lg"
            >
              Go to Profile → Add Number
            </Link>
          </div>
        )}

        {/* Form (only shown if has WhatsApp or during loading) */}
        {hasWhatsapp && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              ref={descriptionRef}
              placeholder="Describe the item (location, color, brand, etc.)..."
              className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition min-h-36 resize-none"
              required
              maxLength={1000}
            />

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
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 p-2.5 rounded-full transition"
                >
                  <FaTimes className="text-white w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700">
              <div className="flex flex-wrap gap-3 items-center">
                <select
                  ref={categoryRef}
                  required
                  className="bg-slate-800 border border-slate-600 text-sky-400 rounded-full px-6 py-3 focus:outline-none focus:border-sky-500 transition"
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

                <label className="cursor-pointer flex items-center gap-3 bg-slate-800 border border-slate-600 hover:border-sky-500 rounded-full px-6 py-3 text-sky-400 transition">
                  <FaImage className="w-5 h-5" />
                  <span>{imagePreview ? "Change Photo" : "Add Photo "}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 disabled:opacity-70 text-white font-bold py-4 px-10 rounded-full transition-all shadow-xl flex items-center justify-center gap-3"
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
        )}
      </div>
    </section>
  );
}

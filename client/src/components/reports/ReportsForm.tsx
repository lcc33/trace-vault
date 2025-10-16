"use client";

import { useRef, useState } from "react";
const baseUrl = process.env.NEXTAUTH_URL!;
export default function ReportForm() {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSelectedImageName(e.target.files[0].name);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Add null checks for all refs
    if (!descriptionRef.current || !categoryRef.current || !imageInputRef.current) {
      alert("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("description", descriptionRef.current.value);
    formData.append("category", categoryRef.current.value);
    

    if (file) formData.append("image", file);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to create report");
      }
    } catch (error) {
      alert("Error creating report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border-b border-slate-700 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 items-start">
          <textarea
            ref={descriptionRef}
            className="flex-1 bg-transparent border-none resize-none min-h-[50px] p-2 text-lg outline-none placeholder:text-slate-400"
            placeholder="What's lost or found?"
            required
            defaultValue="" // Ensure it has a value
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-700">
          <div className="flex flex-col sm:flex-row flex-1 items-center gap-3 w-full">
            <div className="flex flex-1 items-center gap-3 w-full">
              <select
                ref={categoryRef}
                required
                className="bg-transparent text-sky-500 border border-sky-500 rounded-full px-3 py-1.5 text-sm font-semibold"
                defaultValue="" // Ensure it has a value
              >
                <option value="">Category</option>
                <option value="phone">📱 Phone</option>
                <option value="id">🆔 ID Card</option>
                <option value="bag">🎒 Bag</option>
                <option value="wallet">💰 Wallet</option>
                <option value="other">📦 Other</option>
              </select>
              
              <label
                htmlFor="itemImage"
                className="cursor-pointer p-2 rounded-full hover:bg-sky-500/10"
              >
                📷
                <input
                  ref={imageInputRef}
                  id="itemImage"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              
              {selectedImageName && (
                <span className="text-sky-500 text-xs bg-sky-500/10 rounded-full px-3 py-1">
                  {selectedImageName}
                </span>
              )}
            </div>
            
            <div className="flex justify-end w-full sm:w-auto">
              <button
                type="submit"
                disabled={loading}
                className="bg-sky-500 rounded-full px-4 py-2 text-sm font-bold hover:bg-sky-600 disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
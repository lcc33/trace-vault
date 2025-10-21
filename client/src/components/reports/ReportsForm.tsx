"use client";

import { useRef, useState } from "react";

export default function ReportForm() {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSelectedImageName(e.target.files[0].name);
    }
  }

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const description = descriptionRef.current?.value?.trim();
    const category = categoryRef.current?.value;

    // Validate required fields
    if (!description) {
      setError("Please enter a description");
      setLoading(false);
      return;
    }

    if (!category) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("category", category);
    if (file) formData.append("image", file);

    console.log('🔄 Sending POST request to /api/reports');
    console.log('📦 Form data:', {
      description,
      category,
      hasFile: !!file
    });

    const res = await fetch("/api/reports", {
      method: "POST",
      body: formData,
    });

    console.log('📡 Response status:', res.status);
    console.log('📡 Response ok:', res.ok);

    // Check if we got any response at all
    if (!res.ok) {
      // Try to get error message from response
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { error: `HTTP ${res.status}: ${res.statusText}` };
      }
      
      console.error('❌ API error:', errorData);
      setError(errorData.error || `Failed to create report: ${res.status}`);
      return;
    }

    const data = await res.json();
    console.log('✅ Success response:', data);

    // Reset form on success
    if (descriptionRef.current) descriptionRef.current.value = "";
    if (categoryRef.current) categoryRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
    setFile(null);
    setSelectedImageName(null);
    
    // Refresh the page to show the new report
    window.location.reload();

  } catch (error) {
    console.error("❌ Network error creating report:", error);
    setError("Network error: Unable to create report. Check console for details.");
  } finally {
    setLoading(false);
  }
}

  return (
    <section className="border-b border-slate-700 p-4">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
            
          </div>

        )}
        
        <div className="flex gap-3 items-start">
          <textarea
            ref={descriptionRef}
            className="flex-1 bg-transparent border-none resize-none min-h-[50px] p-2 text-lg outline-none placeholder:text-slate-400 text-white"
            placeholder="What's lost or found?"
            required
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-700">
          <div className="flex flex-col sm:flex-row flex-1 items-center gap-3 w-full">
            <div className="flex flex-1 items-center gap-3 w-full">
              <select
                ref={categoryRef}
                required
                className="bg-transparent text-sky-500 border border-sky-500 rounded-full px-3 py-1.5 text-sm font-semibold"
                defaultValue=""
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
                className="cursor-pointer p-2 rounded-full hover:bg-sky-500/10 transition-colors"
                title="Add image"
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
                className="bg-sky-500 rounded-full px-4 py-2 text-sm font-bold hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
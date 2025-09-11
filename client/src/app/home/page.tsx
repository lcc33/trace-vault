"use client";

import React, { useState, useRef } from "react";
import { Navbar } from "@/components";
import Image from "next/image";

interface User {
  _id: string;
  name: string;
  profilePic?: string;
}

interface Report {
  _id: string;
  user: User;
  description: string;
  category: string;
  contact: string;
  image?: string;
  createdAt: string;
}

interface PopupState {
  message: string;
  isSuccess: boolean;
  isVisible: boolean;
}

const defaultAvatar =
  "https://i.pinimg.com/736x/21/f6/fc/21f6fc4abd29ba736e36e540a787e7da.jpg";

export default function Home() {
  // Mock current user
  const [currentUser] = useState<User>({
    _id: "1",
    name: "Muhammad",
    profilePic: defaultAvatar,
  });

  // Mock reports
  const [reports, setReports] = useState<Report[]>([
    {
      _id: "r1",
      user: { _id: "1", name: "Aisha" },
      description: "Lost phone near library",
      category: "phone",
      contact: "08012345678",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "r2",
      user: { _id: "2", name: "John" },
      description: "Found wallet at cafeteria",
      category: "wallet",
      contact: "08098765432",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [popup, setPopup] = useState<PopupState>({
    message: "",
    isSuccess: true,
    isVisible: false,
  });
  const [selectedImageName, setSelectedImageName] = useState("");

  // Form refs
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const showPopup = (message: string, isSuccess: boolean) => {
    setPopup({ message, isSuccess, isVisible: true });
    setTimeout(
      () => setPopup({ message: "", isSuccess: true, isVisible: false }),
      2000
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedImageName(file ? file.name : "");
  };

  // For now, just append report locally
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descriptionRef.current || !categoryRef.current || !contactRef.current)
      return;

    const newReport: Report = {
      _id: Date.now().toString(),
      user: currentUser,
      description: descriptionRef.current.value,
      category: categoryRef.current.value,
      contact: contactRef.current.value,
      createdAt: new Date().toISOString(),
    };

    setReports((prev) => [newReport, ...prev]);
    showPopup("Report posted locally ✅", true);

    // Reset form
    descriptionRef.current.value = "";
    categoryRef.current.value = "";
    contactRef.current.value = "";
    setSelectedImageName("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // Filters
  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || report.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans leading-relaxed overflow-x-hidden">
      <Navbar />
      <main className="max-w-3xl mx-auto min-h-screen border-x border-slate-700 bg-black/40">
        {/* Report form */}
        <section className="border-b border-slate-700 p-4">
          <form onSubmit={handleReportSubmit}>
            <div className="flex gap-3 items-start">
              <Image
                src={currentUser?.profilePic || defaultAvatar}
                alt="Profile"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-sky-400"
              />
              <textarea
                ref={descriptionRef}
                className="flex-1 bg-transparent border-none resize-none min-h-[50px] p-2 text-lg outline-none placeholder:text-slate-400"
                placeholder="What's lost or found?"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-700">
              <div className="flex items-center gap-3">
                <select
                  ref={categoryRef}
                  required
                  className="bg-transparent text-sky-500 border border-sky-500 rounded-full px-3 py-1.5 text-sm font-semibold"
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
              <div className="flex items-center gap-3">
                <input
                  ref={contactRef}
                  type="text"
                  placeholder="Contact info"
                  required
                  className="bg-transparent border border-slate-700 rounded-full px-3 py-1.5 text-sm outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="bg-sky-500 rounded-full px-4 py-2 text-sm font-bold hover:bg-sky-600"
                >
                  Post
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Popup */}
        {popup.isVisible && (
          <div
            className={`fixed top-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg ${
              popup.isSuccess ? "bg-green-500" : "bg-red-600"
            }`}
          >
            {popup.message}
          </div>
        )}

        {/* Search + filter */}
        <section className="border-b border-slate-700 p-4 flex gap-3 sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm focus:border-sky-500 outline-none"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-full px-3 py-2 text-sm focus:border-sky-500 outline-none"
          >
            <option value="all">All</option>
            <option value="phone">📱 Phone</option>
            <option value="id">🆔 ID Card</option>
            <option value="bag">🎒 Bag</option>
            <option value="wallet">💰 Wallet</option>
            <option value="other">📦 Other</option>
          </select>
        </section>

        {/* Reports feed */}
        <section>
          {filteredReports.length === 0 ? (
            <p className="text-center text-slate-400 py-12">
              No reports found.
            </p>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report._id}
                className="border-b border-slate-700 p-4 hover:bg-white/5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Image
                    src={report.user?.profilePic || defaultAvatar}
                    alt={`${report.user?.name}'s profile`}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-bold">{report.user?.name}</span>
                </div>
                <p className="text-sm mb-2">{report.description}</p>
                {report.image && (
                  <Image
                    src={report.image}
                    alt="Report image"
                    width={500}
                    height={300}
                    className="rounded-xl border border-slate-700"
                  />
                )}
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

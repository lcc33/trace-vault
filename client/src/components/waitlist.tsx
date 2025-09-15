"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setAlert(null);

    try {
      // 🔍 check if email already exists
      const q = query(collection(db, "waitlist"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setAlert({
          type: "error",
          message: "⚠️ This email has already joined the waitlist. Try another one.",
        });
      } else {
        await addDoc(collection(db, "waitlist"), {
          email,
          createdAt: serverTimestamp(),
        });

        setAlert({
          type: "success",
          message: "🎉 Thanks for joining! Check your inbox soon.",
        });
        setEmail("");
      }
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      setAlert({
        type: "error",
        message: "❌ Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-900 text-white rounded-2xl shadow-lg w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 bg-gray-800 border-gray-700 text-white"
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Joining..." : "Join"}
        </Button>
      </form>

      {/* Custom alert */}
      {alert && (
        <div
          className={`mt-3 text-sm px-4 py-2 rounded-lg ${
            alert.type === "success"
              ? "bg-green-800 text-green-300 border border-green-600"
              : "bg-red-800 text-red-300 border border-red-600"
          }`}
        >
          {alert.message}
        </div>
      )}

      
    </div>
  );
}

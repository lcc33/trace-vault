// src/app/home/components/Toast.tsx
import { X } from "lucide-react";

interface Props {
  message: string;
  isSuccess: boolean;
  onClose: () => void;
}

export default function Toast({ message, isSuccess, onClose }: Props) {
  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-bold shadow-2xl z-50 flex items-center gap-3 transition-all animate-pulse ${isSuccess ? "bg-green-600" : "bg-red-600"} text-white`}
    >
      {message}
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

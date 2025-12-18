// src/app/home/components/EnlargedImageModal.tsx
import Image from "next/image";

interface Props {
  imageUrl: string | null;
  onClose: () => void;
}

export default function EnlargedImageModal({ imageUrl, onClose }: Props) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-5xl max-h-full">
        <Image
          src={imageUrl}
          alt="Enlarged view"
          width={1200}
          height={800}
          className="rounded-3xl object-contain max-w-full max-h-[90vh] shadow-2xl"
          unoptimized
        />
        <button
          onClick={onClose}
          className="absolute -top-14 right-0 bg-slate-800/80 hover:bg-slate-700/80 text-white w-12 h-12 rounded-full flex items-center justify-center text-3xl font-light backdrop-blur"
        >
          ×
        </button>
      </div>
    </div>
  );
}

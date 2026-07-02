"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function PortfolioGallery({ images }: { images: any[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelected(img.image_url)}
            className="overflow-hidden rounded-lg border bg-white/60 p-0"
          >
            <img src={img.image_url} alt={img.image_url} className="h-40 w-full object-cover" />
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-3 top-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800"
              aria-label="Tutup"
            >
              <X />
            </button>
            <img src={selected} alt="selected" className="w-full max-h-[80vh] object-contain rounded-lg shadow-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

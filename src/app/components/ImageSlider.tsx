'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

export default function ImageSlider({ urls }: { urls: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!urls || urls.length === 0) {
    return (
      <div className="w-full h-48 bg-slate-100 flex flex-col items-center justify-center text-slate-400 rounded-t-xl">
        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-xs font-medium">No Images</span>
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i === 0 ? urls.length - 1 : i - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i === urls.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="relative w-full h-48 bg-black group rounded-t-xl overflow-hidden">
      <img
        src={urls[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      
      {urls.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/40 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/40 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {urls.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Xem anh toan man hinh: vuot trai/phai (dien thoai), mui ten + Esc (may tinh), khoa cuon
// trang phia sau. Dat qua portal len <body> de khong bi cac khung cha (overflow/transform)
// cat mat.
export default function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: string[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const total = images.length;
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onIndexChange((index + 1) % total);
      else if (e.key === "ArrowLeft") onIndexChange((index - 1 + total) % total);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, total, onClose, onIndexChange]);

  if (typeof document === "undefined" || total === 0) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] bg-black/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh"
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || total < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 50) return;
        onIndexChange(dx < 0 ? (index + 1) % total : (index - 1 + total) % total);
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-semibold">
          {index + 1} / {total}
        </span>
        <button type="button" onClick={onClose} aria-label="Đóng" className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
          <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center px-2" onClick={onClose}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt=""
          className="max-w-full max-h-full object-contain select-none"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIndexChange((index - 1 + total) % total);
              }}
              aria-label="Ảnh trước"
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white items-center justify-center"
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIndexChange((index + 1) % total);
              }}
              aria-label="Ảnh sau"
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white items-center justify-center"
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none px-3 py-3">
          {images.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => onIndexChange(i)}
              aria-label={`Ảnh ${i + 1}`}
              className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden ${i === index ? "ring-2 ring-white" : "opacity-60"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

// fit="contain" (mac dinh, giu nguyen hanh vi cu cho card vuong o trang chu/danh sach -
// khong cat noi dung) hoac fit="cover" (dung cho banner rong dau bai viet chi tiet -
// lap day khung, chap nhan cat bot canh de nhin giong banner tap chi du lich).
export default function NewsCoverImage({ src, alt, fit = "contain" }: { src: string; alt: string; fit?: "contain" | "cover" }) {
  const [broken, setBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && (el.naturalWidth <= 2 || el.naturalHeight <= 2)) {
      setBroken(true);
    }
  }, []);

  if (broken) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-brand-sky to-brand-blueMid flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--theme-primary)" strokeWidth="1.6" opacity="0.6">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.5" fill="var(--theme-primary)" stroke="none" />
          <path d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.12 0L4 19" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      onLoad={(e) => {
        const img = e.currentTarget;
        if (img.naturalWidth <= 2 || img.naturalHeight <= 2) setBroken(true);
      }}
      className={`absolute inset-0 w-full h-full ${fit === "cover" ? "object-cover" : "object-contain"} group-hover:scale-105 transition duration-300`}
    />
  );
}

"use client";

import { useEffect, useState } from "react";

// Thanh tien do doc kieu Medium - bam vao chieu cao da cuon / tong chieu cao trang,
// cap nhat lien tuc theo scroll event (khong dung IntersectionObserver vi can % chinh
// xac lien tuc, khong phai chi biet dang o section nao).
export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-[60]" aria-hidden="true">
      <div className="h-full bg-brand-blue transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  );
}

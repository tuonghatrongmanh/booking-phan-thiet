"use client";

import { useEffect, useState } from "react";

const TABS = [
  { id: "tong-quan", label: "Tổng quan" },
  { id: "phong-gia", label: "Phòng & Giá" },
  { id: "danh-gia", label: "Đánh giá" },
];

export default function StaySubNav({ reviewCount }: { reviewCount: number }) {
  const [active, setActive] = useState(TABS[0].id);

  useEffect(() => {
    const sections = TABS.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string, e: React.MouseEvent) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 116;
    window.scrollTo({ top, behavior: "smooth" });
    setActive(id);
  }

  return (
    <nav className="sticky top-[72px] z-30 bg-white border border-[#E5EDF5] rounded-2xl shadow-[0_4px_20px_rgba(0,59,149,0.06)] px-2">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            onClick={(e) => scrollTo(t.id, e)}
            className={`shrink-0 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
              active === t.id ? "text-brand-blue border-brand-blue" : "text-[#5F7894] border-transparent hover:text-brand-blue"
            }`}
          >
            {t.label}
            {t.id === "danh-gia" && reviewCount > 0 ? ` (${reviewCount})` : ""}
          </a>
        ))}
      </div>
    </nav>
  );
}

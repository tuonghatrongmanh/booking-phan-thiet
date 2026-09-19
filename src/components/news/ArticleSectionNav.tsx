"use client";

import { useEffect, useState } from "react";

export type ArticleSection = { id: string; label: string };

// Thanh tab dinh (sticky) duoi header - cung phong cach thanh tab cua trang Am thuc
// (gach chan mau chu dao) nhung la NEO CUON (scroll-spy) thay vi doi noi dung, vi bai
// viet doc lien mach mot mach. Muc dang xem tu sang len; bam vao thi cuon mem toi muc do.
export default function ArticleSectionNav({ sections }: { sections: ArticleSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Các phần của bài viết"
      className="sticky top-[72px] lg:top-[100px] z-30 -mx-6 sm:mx-0 bg-white/95 backdrop-blur border-y sm:border border-[#E8EEF5] sm:rounded-2xl shadow-game-card"
    >
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none px-3">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`shrink-0 px-3.5 py-3 text-sm font-bold border-b-2 transition ${
              activeId === s.id ? "border-food-primary text-food-primary" : "border-transparent text-food-textMuted hover:text-food-text"
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

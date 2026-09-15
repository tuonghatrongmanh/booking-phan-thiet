"use client";

import { useEffect, useState } from "react";
import type { ArticleHeading } from "@/lib/article-content";

// Muc luc bai viet - bam vao muc nao scroll toi muc do; muc dang xem duoc highlight
// tu dong qua IntersectionObserver khi nguoi doc cuon trang (khong can bam vao van
// biet dang o phan nao cua bai).
export default function TableOfContents({ headings }: { headings: ArticleHeading[] }) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Mục lục bài viết">
      <ol className="space-y-1">
        {headings.map((h, i) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`flex items-start gap-2.5 py-1.5 text-sm rounded-lg px-2 -mx-2 transition-colors ${
                activeId === h.id ? "text-brand-blue font-bold bg-brand-sky" : "text-slate-600 hover:text-brand-blue"
              }`}
            >
              <span
                className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeId === h.id ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {i + 1}
              </span>
              <span className="line-clamp-2 leading-snug">{h.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

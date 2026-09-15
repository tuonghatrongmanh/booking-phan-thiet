"use client";

import { useEffect, useRef } from "react";

// autoPlay: tu dong cuon lien tuc sang phai (khi co nhieu hon 1 hang noi dung),
// dung lai khi nguoi dung dua chuot/cham vao, va lap lai tu dau khi het.
export default function ScrollCarousel({
  children,
  autoPlay = false,
  showLeftArrow = false,
}: {
  children: React.ReactNode;
  autoPlay?: boolean;
  showLeftArrow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  function scroll(dir: 1 | -1) {
    ref.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  }

  useEffect(() => {
    if (!autoPlay) return;
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const onEnter = () => (pausedRef.current = true);
    const onLeave = () => (pausedRef.current = false);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onEnter, { passive: true });
    el.addEventListener("touchend", onLeave);

    const id = setInterval(() => {
      if (pausedRef.current || !el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 320, behavior: "smooth" });
      }
    }, 3000);

    return () => {
      clearInterval(id);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onEnter);
      el.removeEventListener("touchend", onLeave);
    };
  }, [autoPlay]);

  return (
    <div className="relative min-w-0 -mx-1 sm:-mx-2">
      <div
        ref={ref}
        className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory px-1 sm:px-2 py-4"
      >
        {children}
      </div>
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Xem trước"
          className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -left-1 sm:left-0 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center text-slate-600 hover:text-brand-blue hover:brightness-95 active:scale-95 transition z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      )}
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Xem tiếp"
        className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -right-1 sm:right-0 w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center text-slate-600 hover:text-brand-blue hover:brightness-95 active:scale-95 transition z-10"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

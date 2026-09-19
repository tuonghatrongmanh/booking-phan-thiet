"use client";

import { Children, useRef, useState } from "react";

// Carousel vuot ngang cho DIEN THOAI (mot the lon moi lan, the ke tiep ho ra mot phan de bao
// "con noi dung"), tu chuyen thanh luoi tu man hinh >= sm. Co cham tron chi vi tri; khoi co
// data-swipe-hint nen SwipeHints tu lam hieu ung lướt nhe + hinh ban tay khi cuon toi.
// desktopGrid: cac class luoi cho man hinh lon, vd "sm:grid-cols-3" hoac "sm:grid-cols-2 lg:grid-cols-4".
export default function SwipeCarousel({
  children,
  desktopGrid,
  gapClass = "gap-3 sm:gap-5",
  dotsClass = "",
}: {
  children: React.ReactNode;
  desktopGrid: string;
  gapClass?: string;
  dotsClass?: string;
}) {
  const items = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = trackRef.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return;
    const step = first.offsetWidth + 12; // gap-3
    setActive(Math.max(0, Math.min(items.length - 1, Math.round(el.scrollLeft / step))));
  }

  function goTo(i: number) {
    const el = trackRef.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (el && child) el.scrollTo({ left: child.offsetLeft - (el.firstElementChild as HTMLElement).offsetLeft, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        data-swipe-hint
        className={`flex ${gapClass} overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-6 px-6 py-2 sm:mx-0 sm:px-0 sm:py-0 sm:grid sm:overflow-visible sm:snap-none ${desktopGrid}`}
      >
        {items.map((child, i) => (
          <div key={i} className="snap-start shrink-0 w-[82%] sm:w-auto sm:shrink">
            {child}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className={`sm:hidden flex items-center justify-center gap-1.5 mt-3 ${dotsClass}`} role="tablist" aria-label="Vị trí thẻ">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Thẻ ${i + 1}`}
              aria-selected={i === active}
              role="tab"
              className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-brand-blue" : "w-2 bg-brand-blueMid"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

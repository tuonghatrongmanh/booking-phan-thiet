"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryItem = { type: "image"; url: string } | { type: "video"; videoId: string; caption: string | null };

// Mirror y het FoodGallery.tsx (dung chung bang mau food-* - thuc chat la mau xanh
// thuong hieu chung cua site, khong rieng cho Am thuc) theo yeu cau bo cuc trang chi
// tiet Dia diem tham quan phai giong Am thuc.
export default function PlaceGallery({ items, badge }: { items: GalleryItem[]; badge?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0];
  const total = items.length;

  if (!active) {
    return (
      <div className="relative w-full aspect-[4/3] rounded-2xl bg-food-light flex items-center justify-center text-food-primary/25 text-6xl">
        <i className="fa-solid fa-mountain-sun" aria-hidden="true" />
      </div>
    );
  }

  function go(dir: 1 | -1) {
    setActiveIndex((i) => (i + dir + total) % total);
  }

  return (
    <div>
      <div className="grid grid-cols-[1fr_130px] sm:grid-cols-[1fr_160px] gap-2">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-food-light">
          {badge && (
            <span className="absolute top-3 left-3 z-10 text-[11px] font-bold text-white bg-food-primary px-2.5 py-1 rounded-full flex items-center gap-1">
              <i className="fa-solid fa-fire" aria-hidden="true" /> {badge}
            </span>
          )}

          {active.type === "image" ? (
            <Image src={active.url} alt="" fill sizes="(max-width: 640px) 100vw, 700px" className="object-cover" />
          ) : (
            <div className="absolute inset-0">
              <Image src={`https://img.youtube.com/vi/${active.videoId}/hqdefault.jpg`} alt="" fill sizes="(max-width: 640px) 100vw, 700px" className="object-cover" />
              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-2">
                <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-food-primary text-xl">
                  <i className="fa-solid fa-play" aria-hidden="true" />
                </span>
                {active.caption && <p className="text-white text-xs font-bold px-4 text-center">{active.caption}</p>}
              </div>
              <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">HD</span>
            </div>
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Ảnh trước"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-food-text shadow"
              >
                <i className="fa-solid fa-chevron-left" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Ảnh sau"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-food-text shadow"
              >
                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
              </button>
              <span className="absolute bottom-2 left-2 text-[11px] font-bold text-white bg-black/50 px-2 py-1 rounded-full">
                {activeIndex + 1}/{total}
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 content-start">
          {items.slice(0, 6).map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square rounded-lg overflow-hidden bg-food-light ${i === activeIndex ? "ring-2 ring-food-primary" : ""}`}
            >
              {item.type === "image" ? (
                <Image src={item.url} alt="" fill sizes="130px" className="object-cover" />
              ) : (
                <>
                  <Image src={`https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`} alt="" fill sizes="130px" className="object-cover" />
                  <span className="absolute inset-0 bg-black/25 flex items-center justify-center text-white">
                    <i className="fa-solid fa-play text-sm" aria-hidden="true" />
                  </span>
                </>
              )}
              {i === 5 && total > 6 && (
                <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-bold">
                  +{total - 6}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

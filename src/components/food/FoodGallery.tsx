"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import ImageLightbox from "@/components/ui/ImageLightbox";

type GalleryItem = { type: "image"; url: string } | { type: "video"; videoId: string; caption: string | null };

// Thu vien anh mon an. Dien thoai: vuot ngang tung anh (kem so thu tu + dai anh nho phia duoi),
// bam vao anh de xem toan man hinh. May tinh: anh lon + luoi anh nho ben phai (giu nhu cu),
// bam anh lon de phong to.
export default function FoodGallery({ items, badge }: { items: GalleryItem[]; badge?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = items.length;
  const active = items[activeIndex] ?? items[0];

  // Chi anh (khong video) di vao lightbox; anh xa chi so item -> chi so lightbox
  const imageUrls = items.filter((i): i is { type: "image"; url: string } => i.type === "image").map((i) => i.url);
  function lightboxIndexOf(itemIndex: number) {
    return items.slice(0, itemIndex).filter((i) => i.type === "image").length;
  }
  function itemIndexOfLightbox(li: number) {
    let seen = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type === "image") seen++;
      if (seen === li) return i;
    }
    return 0;
  }

  if (!active) {
    return (
      <div className="relative w-full aspect-[4/3] rounded-2xl bg-food-light flex items-center justify-center text-food-primary/25 text-6xl">
        <i className="fa-solid fa-utensils" aria-hidden="true" />
      </div>
    );
  }

  function go(dir: 1 | -1) {
    setActiveIndex((i) => (i + dir + total) % total);
  }

  function open(itemIndex: number) {
    if (items[itemIndex].type === "image") setLightbox(lightboxIndexOf(itemIndex));
  }

  function onTrackScroll() {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    setActiveIndex(Math.max(0, Math.min(total - 1, Math.round(el.scrollLeft / el.clientWidth))));
  }

  function scrollToIndex(i: number) {
    setActiveIndex(i);
    trackRef.current?.scrollTo({ left: i * (trackRef.current.clientWidth || 0), behavior: "smooth" });
  }

  const badgeEl = badge && (
    <span className="absolute top-3 left-3 z-10 text-[11px] font-bold text-white bg-food-primary px-2.5 py-1 rounded-full flex items-center gap-1">
      <i className="fa-solid fa-fire" aria-hidden="true" /> {badge}
    </span>
  );

  return (
    <div>
      {/* ===== Điện thoại: vuốt ngang ===== */}
      <div className="sm:hidden">
        <div className="relative">
          {badgeEl}
          <div
            ref={trackRef}
            onScroll={onTrackScroll}
            data-swipe-hint={total > 1 ? "" : undefined}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-2xl bg-food-light"
          >
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => open(i)}
                className="relative shrink-0 w-full aspect-[4/3] snap-center"
                aria-label={item.type === "image" ? `Xem ảnh ${i + 1}` : "Video"}
              >
                {item.type === "image" ? (
                  <Image src={item.url} alt="" fill sizes="100vw" className="object-cover" priority={i === 0} />
                ) : (
                  <>
                    <Image src={`https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`} alt="" fill sizes="100vw" className="object-cover" />
                    <span className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-food-primary text-xl">
                        <i className="fa-solid fa-play" aria-hidden="true" />
                      </span>
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
          {total > 1 && (
            <span className="absolute bottom-2 right-2 text-[11px] font-bold text-white bg-black/55 px-2.5 py-1 rounded-full">
              {activeIndex + 1}/{total}
            </span>
          )}
        </div>

        {total > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none mt-2">
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Ảnh ${i + 1}`}
                className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-food-light ${i === activeIndex ? "ring-2 ring-food-primary" : "opacity-70"}`}
              >
                <Image
                  src={item.type === "image" ? item.url : `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== Máy tính: ảnh lớn + lưới ảnh nhỏ ===== */}
      <div className="hidden sm:grid grid-cols-[1fr_160px] gap-2">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-food-light">
          {badgeEl}

          {active.type === "image" ? (
            <button type="button" onClick={() => open(activeIndex)} className="absolute inset-0 cursor-zoom-in" aria-label="Phóng to ảnh">
              <Image src={active.url} alt="" fill sizes="700px" className="object-cover" />
            </button>
          ) : (
            <div className="absolute inset-0">
              <Image src={`https://img.youtube.com/vi/${active.videoId}/hqdefault.jpg`} alt="" fill sizes="700px" className="object-cover" />
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
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-food-text shadow"
              >
                <i className="fa-solid fa-chevron-left" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Ảnh sau"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-food-text shadow"
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
                <Image src={item.url} alt="" fill sizes="80px" className="object-cover" />
              ) : (
                <>
                  <Image src={`https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`} alt="" fill sizes="80px" className="object-cover" />
                  <span className="absolute inset-0 bg-black/25 flex items-center justify-center text-white">
                    <i className="fa-solid fa-play text-sm" aria-hidden="true" />
                  </span>
                </>
              )}
              {i === 5 && total > 6 && (
                <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-bold">+{total - 6}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <ImageLightbox
          images={imageUrls}
          index={lightbox}
          onIndexChange={(li) => {
            setLightbox(li);
            setActiveIndex(itemIndexOfLightbox(li));
          }}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

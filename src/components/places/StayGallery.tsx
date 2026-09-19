"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type GalleryImage = { id: string; url: string; caption: string | null };

export default function StayGallery({
  images,
  name,
  isTrusted,
}: {
  images: GalleryImage[];
  name: string;
  isTrusted: boolean;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  function markFailed(id: string) {
    setFailedIds((prev) => new Set(prev).add(id));
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`bpt_fav_${name}`);
      if (saved === "1") setFavorite(true);
    } catch {
      // ignore
    }
  }, [name]);

  function toggleFavorite() {
    setFavorite((f) => {
      const next = !f;
      try {
        localStorage.setItem(`bpt_fav_${name}`, next ? "1" : "0");
      } catch {
        // storage unavailable - favorite still toggles for this session
      }
      return next;
    });
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // user cancelled share sheet - not an error
    }
  }

  // Lightbox mo: khoa cuon trang phia sau, ho tro phim mui ten / Esc tren may tinh
  const lightboxOpen = lightboxIndex !== null;
  useEffect(() => {
    if (!lightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIndex(null);
      else if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
      else if (e.key === "ArrowLeft") setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, images.length]);

  function onTrackScroll() {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== mobileIndex) setMobileIndex(i);
  }

  function onLightboxTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    setLightboxIndex((i) => (i === null ? null : dx < 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length));
  }

  const slots = images.slice(0, 5);
  const hasImages = slots.length > 0;

  function openLightbox(i: number) {
    setLightboxIndex(i);
  }

  function nextImage(e?: React.MouseEvent) {
    e?.stopPropagation();
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
  }

  function prevImage(e?: React.MouseEvent) {
    e?.stopPropagation();
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }

  return (
    <div>
      <div className="relative rounded-[18px] overflow-hidden">
        {!hasImages ? (
          <div className="h-[420px] sm:h-[450px] bg-[#EDF3F8] flex flex-col items-center justify-center gap-2 text-slate-400">
            <i className="fa-solid fa-image-slash text-3xl" aria-hidden="true" />
            <p className="text-sm font-semibold">Không có hình ảnh</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-1.5 h-[450px]">
              <button
                type="button"
                onClick={() => openLightbox(0)}
                aria-label="Xem ảnh"
                className="relative col-span-2 row-span-2 group overflow-hidden bg-[#EDF3F8]"
              >
                {failedIds.has(slots[0].id) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <i className="fa-solid fa-image-slash text-3xl" aria-hidden="true" />
                    <p className="text-sm font-semibold">Không có hình ảnh</p>
                  </div>
                ) : (
                  <>
                    <Image
                      src={slots[0].url}
                      alt={name}
                      fill
                      priority
                      sizes="50vw"
                      onError={() => markFailed(slots[0].id)}
                      onLoad={(e) => { if (e.currentTarget.naturalWidth === 0) markFailed(slots[0].id); }}
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.08] transition-colors" />
                  </>
                )}
              </button>

              {[1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => openLightbox(i)}
                  aria-label="Xem ảnh"
                  disabled={!slots[i]}
                  className="relative group overflow-hidden bg-[#EDF3F8]"
                >
                  {slots[i] && !failedIds.has(slots[i].id) ? (
                    <>
                      <Image
                        src={slots[i].url}
                        alt={name}
                        fill
                        sizes="25vw"
                        loading="lazy"
                        onError={() => markFailed(slots[i].id)}
                        onLoad={(e) => { if (e.currentTarget.naturalWidth === 0) markFailed(slots[i].id); }}
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.08] transition-colors" />
                    </>
                  ) : (
                    <i className="fa-regular fa-image text-slate-300 text-xl absolute inset-0 m-auto h-fit w-fit" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>

            {/* Điện thoại: 1 khung ảnh vuốt ngang xem hết ảnh (không kéo dài trang), chạm để xem toàn màn hình */}
            <div className="sm:hidden relative h-[300px] bg-[#EDF3F8]">
              <div
                ref={trackRef}
                onScroll={onTrackScroll}
                className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-none overscroll-x-contain"
              >
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => openLightbox(i)}
                    aria-label={`Xem ảnh ${i + 1} / ${images.length}`}
                    className="relative shrink-0 w-full h-full snap-center"
                  >
                    {failedIds.has(img.id) ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                        <i className="fa-solid fa-image-slash text-3xl" aria-hidden="true" />
                        <p className="text-sm font-semibold">Không có hình ảnh</p>
                      </div>
                    ) : (
                      <Image
                        src={img.url}
                        alt={`${name} - ảnh ${i + 1}`}
                        fill
                        priority={i === 0}
                        loading={i === 0 ? undefined : "lazy"}
                        sizes="100vw"
                        className="object-cover"
                        onError={() => markFailed(img.id)}
                        onLoad={(e) => { if (e.currentTarget.naturalWidth === 0) markFailed(img.id); }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => openLightbox(mobileIndex)}
                className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 bg-black/60 text-white text-xs font-bold px-3 py-2 rounded-full"
              >
                <i className="fa-solid fa-images" aria-hidden="true" /> {mobileIndex + 1} / {images.length}
                {images.length > 1 && <span className="font-medium opacity-90">· Vuốt hoặc chạm để xem</span>}
              </button>
            </div>
          </>
        )}

        {isTrusted && (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-blue/95 px-3 py-1.5 rounded-full shadow">
            <i className="fa-solid fa-shield-check" aria-hidden="true" /> Uy tín
          </span>
        )}

        {hasImages && (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 left-4 hidden sm:inline-flex items-center gap-1.5 bg-black/55 hover:bg-black/65 transition text-white text-sm font-semibold px-3.5 py-2.5 rounded-[10px]"
          >
            <i className="fa-solid fa-camera" aria-hidden="true" /> Xem tất cả {images.length} ảnh
          </button>
        )}

        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            type="button"
            onClick={share}
            aria-label="Chia sẻ"
            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white transition flex items-center justify-center text-[#163A5F] shadow"
          >
            <i className="fa-solid fa-share-nodes" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label={favorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
            aria-pressed={favorite}
            className="w-10 h-10 rounded-full bg-white/95 hover:bg-white active:scale-95 transition flex items-center justify-center shadow"
          >
            <i className={favorite ? "fa-solid fa-heart text-[#EF4444]" : "fa-regular fa-heart text-[#163A5F]"} aria-hidden="true" />
          </button>
        </div>
      </div>

      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={onLightboxTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Đóng"
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 sm:right-5 z-10 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark text-xl" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={prevImage}
            aria-label="Ảnh trước"
            className="absolute left-4 sm:left-8 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>

          <div className="relative w-[94vw] h-[70dvh] sm:w-[90vw] sm:h-[80dvh]" onClick={(e) => e.stopPropagation()}>
            {failedIds.has(images[lightboxIndex].id) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60">
                <i className="fa-solid fa-image-slash text-4xl" aria-hidden="true" />
                <p className="text-sm font-semibold">Không có hình ảnh</p>
              </div>
            ) : (
              <Image
                src={images[lightboxIndex].url}
                alt={name}
                fill
                className="object-contain"
                sizes="90vw"
                onError={() => markFailed(images[lightboxIndex].id)}
                onLoad={(e) => { if (e.currentTarget.naturalWidth === 0) markFailed(images[lightboxIndex].id); }}
              />
            )}
          </div>

          <button
            type="button"
            onClick={nextImage}
            aria-label="Ảnh sau"
            className="absolute right-4 sm:right-8 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>

          <span className="absolute top-[max(1.25rem,env(safe-area-inset-top))] left-4 text-white/85 text-sm font-semibold">
            {lightboxIndex + 1} / {images.length}
          </span>

          {images.length > 1 && (
            <div
              className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-0 flex gap-2 overflow-x-auto scrollbar-none px-4 justify-start sm:justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={`Chuyển tới ảnh ${i + 1}`}
                  className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${i === lightboxIndex ? "border-white" : "border-transparent opacity-60"}`}
                >
                  <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

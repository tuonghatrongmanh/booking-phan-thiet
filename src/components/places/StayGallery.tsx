"use client";

import { useEffect, useState } from "react";
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

            <div className="sm:hidden relative h-[300px] bg-[#EDF3F8]" onClick={() => openLightbox(0)}>
              {failedIds.has(slots[0].id) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <i className="fa-solid fa-image-slash text-3xl" aria-hidden="true" />
                  <p className="text-sm font-semibold">Không có hình ảnh</p>
                </div>
              ) : (
                <Image
                  src={slots[0].url}
                  alt={name}
                  fill
                  priority
                  className="object-cover"
                  onError={() => markFailed(slots[0].id)}
                  onLoad={(e) => { if (e.currentTarget.naturalWidth === 0) markFailed(slots[0].id); }}
                />
              )}
              <span className="absolute bottom-3 right-3 bg-black/55 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                1 / {images.length}
              </span>
            </div>
          </>
        )}

        {isTrusted && (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#168BE0]/95 px-3 py-1.5 rounded-full shadow">
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
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Đóng"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
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

          <div className="relative w-[90vw] h-[80vh]" onClick={(e) => e.stopPropagation()}>
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

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-semibold">
            {lightboxIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
}

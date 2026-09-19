"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import ScrollCarousel from "@/components/home/ScrollCarousel";
import { tiktokEmbedSrc, videoIdFromStoredUrl } from "@/lib/tiktok-embed";

export type SaleVideoItem = { id: string; sourceUrl: string; thumbnailUrl: string | null; title: string | null; ago: string };

// Danh sách video TikTok của Sale: bấm vào là xem NGAY trên trang (khung phát nhúng chính thức của TikTok);
// link rút gọn không có id thì mở sang TikTok như cũ.
export default function SaleVideoGrid({ videos }: { videos: SaleVideoItem[] }) {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <>
      <ScrollCarousel showLeftArrow>
        {videos.map((v) => {
          const vid = videoIdFromStoredUrl(v.sourceUrl);
          const card = (
            <>
              <div className="relative w-full aspect-[9/16] bg-slate-100">
                {v.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <i className="fa-brands fa-tiktok text-3xl" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-black/55 flex items-center justify-center">
                    <i className="fa-solid fa-play text-white text-sm" aria-hidden="true" />
                  </div>
                </div>
                <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <i className="fa-brands fa-tiktok" aria-hidden="true" /> {v.ago}
                </span>
              </div>
              <p className="text-xs text-slate-600 p-2 line-clamp-2 leading-snug">{v.title || "Xem video"}</p>
            </>
          );
          const cls = "shrink-0 w-36 sm:w-40 snap-start rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg transition text-left";
          return vid ? (
            <button key={v.id} type="button" onClick={() => setPlaying(vid)} className={cls} aria-label="Xem video">
              {card}
            </button>
          ) : (
            <a key={v.id} href={v.sourceUrl} target="_blank" rel="noopener noreferrer" className={cls}>
              {card}
            </a>
          );
        })}
      </ScrollCarousel>

      {playing &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-3" role="dialog" aria-modal="true" onClick={() => setPlaying(null)}>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setPlaying(null)}
                aria-label="Đóng video"
                className="absolute -top-11 right-0 w-10 h-10 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
              </button>
              <iframe
                src={tiktokEmbedSrc(playing)}
                title="Video TikTok"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                className="block rounded-2xl bg-black w-[min(92vw,340px)] h-[min(78vh,640px)] border-0"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import GameCardIllustration from "./GameCardIllustration";

type Game = { id: string; slug: string; name: string; comingSoon: boolean; image: string | null };

// Dai game dang icon vuong + ten (kieu cong game app-store), link THANG vao trang
// choi tung game (tiet kiem khong gian, khong con luoi card chi tiet rieng ben duoi
// nua). Hien toi da ~14 o/man hinh (voi kich thuoc o hien tai, 1400px container vua
// khoang 14 o), nhieu hon thi cuon ngang bang nut mui ten 2 ben. Anh icon (g.image) do
// admin upload qua GameForm - null thi fallback ve SVG minh hoa GameCardIllustration.
export default function GameQuickPicker({
  games,
  badgeBySlug,
}: {
  games: Game[];
  badgeBySlug: Record<string, "hot" | "new">;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: dir * 480, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Xem game trước"
        className="hidden sm:flex absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-game-cardHover items-center justify-center text-game-primary hover:bg-game-light active:scale-95 transition"
      >
        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
      </button>

      <div ref={scrollerRef} className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth snap-x px-1 py-1">
        {games.map((g) => {
          const badge = badgeBySlug[g.slug];

          const tile = (
            <div className="relative w-[76px] h-[76px] mx-auto rounded-2xl overflow-hidden shadow-game-card group-hover:shadow-game-cardHover group-hover:-translate-y-1 transition-all duration-200">
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, var(--color-game-primary), var(--color-game-deep))" }}
              />
              {badge && (
                <span
                  className={`absolute top-0 left-0 z-10 text-[8px] font-extrabold px-1.5 py-0.5 rounded-br-lg ${
                    badge === "hot" ? "bg-brand-red text-white" : "bg-game-yellow text-game-navy"
                  }`}
                >
                  {badge === "hot" ? "HOT" : "MỚI"}
                </span>
              )}
              {g.comingSoon && (
                <span className="absolute inset-0 z-10 bg-white/55 flex items-center justify-center text-[9px] font-bold text-game-navy text-center leading-tight px-1">
                  Sắp ra mắt
                </span>
              )}
              {g.image ? (
                <Image src={g.image} alt="" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="scale-50">
                    <GameCardIllustration slug={g.slug} />
                  </div>
                </div>
              )}
            </div>
          );

          const label = (
            <p className="mt-1.5 text-xs font-bold text-game-textDark leading-tight line-clamp-2 group-hover:text-game-primary transition-colors">
              {g.name}
            </p>
          );

          return g.comingSoon ? (
            <div key={g.id} className="group shrink-0 w-[84px] text-center snap-start cursor-default">
              {tile}
              {label}
            </div>
          ) : (
            <Link key={g.id} href={`/game-trung-thuong/${g.slug}`} className="group shrink-0 w-[84px] text-center snap-start focus:outline-none">
              {tile}
              {label}
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Xem game tiếp theo"
        className="hidden sm:flex absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-game-cardHover items-center justify-center text-game-primary hover:bg-game-light active:scale-95 transition"
      >
        <i className="fa-solid fa-chevron-right" aria-hidden="true" />
      </button>
    </div>
  );
}

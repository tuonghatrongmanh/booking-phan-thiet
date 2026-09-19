"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useGamePlay } from "./useGamePlay";
import { emitCoinsEarned } from "@/lib/coin-fx";

type Props = {
  slug: string;
  gameName: string;
  dailyLimit: number;
  initialBalance: number;
  alreadyPlayedToday: boolean;
};

const MAX_CASTS = 3;
const BITE_WINDOW_MS = 1300;

type Phase = "idle" | "waiting" | "biting" | "missed" | "caught";

// Game "Cau ca doi xu" - moi lan tha can, cho ngau nhien 1-2.5s roi ca "can" trong
// 1.3s, bam trung ca de bat. Choi du 3 lan tha thi duoc nhan xu (so ca bat duoc chi
// la yeu to vui, xu van server random trong khoang cong khai cua game).
export default function FishingGame({ slug, gameName, dailyLimit, initialBalance, alreadyPlayedToday }: Props) {
  const { balance, claiming, error, done, claim } = useGamePlay(slug, initialBalance, alreadyPlayedToday);
  const [phase, setPhase] = useState<Phase>("idle");
  const [castsUsed, setCastsUsed] = useState(0);
  const [catches, setCatches] = useState(0);
  const [fishPos, setFishPos] = useState({ x: 50, y: 50 });
  const [result, setResult] = useState<number | null>(null);
  const windowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const claimBtnRef = useRef<HTMLButtonElement>(null);

  const roundOver = castsUsed >= MAX_CASTS;

  function cast() {
    if (phase !== "idle" || roundOver || done) return;
    setPhase("waiting");
    const delay = 1000 + Math.random() * 1500;

    setTimeout(() => {
      setFishPos({ x: 20 + Math.random() * 60, y: 25 + Math.random() * 50 });
      setPhase("biting");
      windowTimerRef.current = setTimeout(() => {
        setPhase("missed");
        setCastsUsed((c) => c + 1);
        setTimeout(() => setPhase("idle"), 900);
      }, BITE_WINDOW_MS);
    }, delay);
  }

  function catchFish() {
    if (phase !== "biting") return;
    if (windowTimerRef.current) clearTimeout(windowTimerRef.current);
    setCatches((c) => c + 1);
    setCastsUsed((c) => c + 1);
    setPhase("caught");
    setTimeout(() => setPhase("idle"), 900);
  }

  async function handleClaim() {
    const outcome = await claim();
    if (!outcome) return;
    setResult(outcome.coinsWon);
    emitCoinsEarned(outcome.coinsWon, outcome.newBalance, claimBtnRef.current);
  }

  function resetGame() {
    setCastsUsed(0);
    setCatches(0);
    setPhase("idle");
    setResult(null);
  }

  return (
    <div className="bg-white rounded-[24px] shadow-blog-card p-6 sm:p-10 max-w-2xl mx-auto text-center">
      <p className="text-sm text-slate-500 mb-1">Xu hiện có</p>
      <p className="font-display font-extrabold text-3xl text-brand-blue mb-6 flex items-center justify-center gap-2">
        <i className="fa-solid fa-coins text-amber-400" aria-hidden="true" /> {balance.toLocaleString("vi-VN")}
      </p>

      <div
        className="relative w-full h-64 rounded-2xl overflow-hidden mb-5 flex items-center justify-center"
        style={{ background: "linear-gradient(180deg, var(--theme-primary-soft), var(--theme-primary-mid))" }}
      >
        <div className="absolute top-3 left-3 bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-brand-blue">
          Lượt thả: {castsUsed}/{MAX_CASTS}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-brand-green">
          Bắt được: {catches}
        </div>

        {phase === "idle" && !roundOver && (
          <button
            type="button"
            onClick={cast}
            disabled={done}
            className="bg-brand-blue text-white font-bold rounded-full px-6 py-3 hover:brightness-95 transition disabled:opacity-50"
          >
            <i className="fa-solid fa-water" aria-hidden="true" /> Thả cần
          </button>
        )}

        {phase === "waiting" && <p className="font-display font-bold text-brand-blue">Đang chờ cá cắn câu...</p>}

        {phase === "biting" && (
          <button
            type="button"
            onClick={catchFish}
            className="absolute w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-2xl text-brand-blue animate-fade-up"
            style={{ left: `${fishPos.x}%`, top: `${fishPos.y}%`, animationDuration: "0.15s" }}
            aria-label="Bắt cá"
          >
            <i className="fa-solid fa-fish" aria-hidden="true" />
          </button>
        )}

        {phase === "missed" && <p className="font-display font-bold text-brand-red">Cá đã chạy mất rồi!</p>}
        {phase === "caught" && <p className="font-display font-bold text-brand-green">🎉 Bắt được cá!</p>}
      </div>

      {roundOver && result === null && (
        <div className="mb-4">
          <p className="text-slate-600 mb-3">Bạn đã bắt được {catches}/{MAX_CASTS} lần thả cần!</p>
          <button
            ref={claimBtnRef}
            type="button"
            onClick={handleClaim}
            disabled={claiming}
            className="bg-brand-blue text-white font-bold rounded-full px-6 py-3 hover:brightness-95 transition disabled:opacity-50"
          >
            {claiming ? "Đang nhận..." : "Nhận xu thưởng"}
          </button>
        </div>
      )}

      {result !== null && (
        <div className="mb-4">
          <p className="font-display font-bold text-brand-green mb-3">🎉 Bạn nhận được {result} xu!</p>
          {!done && (
            <button type="button" onClick={resetGame} className="text-sm font-bold text-brand-blue hover:underline">
              Chơi lại vòng khác
            </button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2 mb-3 inline-block">{error}</p>}

      {done && (
        <p className="text-sm text-slate-400 mb-3">
          Bạn đã dùng hết lượt {gameName.toLowerCase()} hôm nay ({dailyLimit} lượt/ngày). Quay lại vào ngày mai nhé!
        </p>
      )}

      <p>
        <Link href="/game-trung-thuong" className="text-sm font-bold text-brand-blue hover:underline">
          ← Quay lại danh sách game
        </Link>
      </p>
    </div>
  );
}

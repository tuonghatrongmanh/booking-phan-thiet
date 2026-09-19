"use client";

import { useEffect, useRef, useState } from "react";
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

const ROUND_SECONDS = 12;
const SPAWN_MS = 850;
const ITEM_LIFETIME_MS = 1400;

type Item = { id: number; x: number; y: number };

// Game "Click nhan xu": trong 12s, vat pham xuat hien ngau nhien trong khung choi,
// click truoc khi bien mat de "thu" - so luong thu duoc chi la yeu to vui/thu hut,
// KHONG quyet dinh so xu (xu van do server random trong khoang cong khai cua game,
// giong moi game khac - tranh gay hieu lam "click nhieu = duoc nhieu xu" khong dung).
export default function ClickCollectGame({ slug, gameName, dailyLimit, initialBalance, alreadyPlayedToday }: Props) {
  const { balance, claiming, error, done, claim } = useGamePlay(slug, initialBalance, alreadyPlayedToday);
  const [phase, setPhase] = useState<"idle" | "playing" | "finished" | "claimed">("idle");
  const [items, setItems] = useState<Item[]>([]);
  const [collected, setCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [result, setResult] = useState<number | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idRef = useRef(0);
  const claimBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  function startRound() {
    if (done) return;
    setPhase("playing");
    setCollected(0);
    setItems([]);
    setTimeLeft(ROUND_SECONDS);
    setResult(null);

    spawnTimerRef.current = setInterval(() => {
      const id = idRef.current++;
      const x = 8 + Math.random() * 82;
      const y = 10 + Math.random() * 72;
      setItems((cur) => [...cur, { id, x, y }]);
      setTimeout(() => setItems((cur) => cur.filter((it) => it.id !== id)), ITEM_LIFETIME_MS);
    }, SPAWN_MS);

    countdownRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
          if (countdownRef.current) clearInterval(countdownRef.current);
          setItems([]);
          setPhase("finished");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function collect(id: number) {
    setItems((cur) => cur.filter((it) => it.id !== id));
    setCollected((c) => c + 1);
  }

  async function handleClaim() {
    const outcome = await claim();
    if (!outcome) return;
    setPhase("claimed");
    setResult(outcome.coinsWon);
    emitCoinsEarned(outcome.coinsWon, outcome.newBalance, claimBtnRef.current);
  }

  return (
    <div className="bg-white rounded-[24px] shadow-blog-card p-6 sm:p-10 max-w-2xl mx-auto text-center">
      <p className="text-sm text-slate-500 mb-1">Xu hiện có</p>
      <p className="font-display font-extrabold text-3xl text-brand-blue mb-6 flex items-center justify-center gap-2">
        <i className="fa-solid fa-coins text-amber-400" aria-hidden="true" /> {balance.toLocaleString("vi-VN")}
      </p>

      <div
        ref={areaRef}
        className="relative w-full h-72 rounded-2xl overflow-hidden mb-5"
        style={{ background: "linear-gradient(180deg, var(--theme-primary-soft), var(--theme-primary-mid))" }}
      >
        {phase === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={startRound}
              disabled={done}
              className="bg-brand-blue text-white font-bold rounded-full px-6 py-3 hover:brightness-95 transition disabled:opacity-50"
            >
              Bắt đầu ({ROUND_SECONDS}s)
            </button>
          </div>
        )}

        {phase === "playing" && (
          <>
            <div className="absolute top-3 left-3 bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-brand-blue">
              ⏱ {timeLeft}s
            </div>
            <div className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-brand-green">
              Đã thu: {collected}
            </div>
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => collect(it.id)}
                className="absolute w-11 h-11 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-lg animate-fade-up hover:scale-110 transition-transform"
                style={{ left: `${it.x}%`, top: `${it.y}%`, animationDuration: "0.2s" }}
                aria-label="Thu xu"
              >
                <i className="fa-solid fa-coins" aria-hidden="true" />
              </button>
            ))}
          </>
        )}

        {(phase === "finished" || phase === "claimed") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/60">
            <p className="font-display font-bold text-slate-800">Bạn đã thu được {collected} vật phẩm!</p>
            {phase === "finished" ? (
              <button
                ref={claimBtnRef}
                type="button"
                onClick={handleClaim}
                disabled={claiming}
                className="bg-brand-blue text-white font-bold rounded-full px-6 py-3 hover:brightness-95 transition disabled:opacity-50"
              >
                {claiming ? "Đang nhận..." : "Nhận xu thưởng"}
              </button>
            ) : (
              result !== null && (
                <p className="font-display font-bold text-brand-green">🎉 Bạn nhận được {result} xu!</p>
              )
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2 mb-3 inline-block">{error}</p>}

      {done && phase !== "finished" && (
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

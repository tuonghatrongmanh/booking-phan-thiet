"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useGamePlay } from "./useGamePlay";
import { emitCoinsEarned } from "@/lib/coin-fx";

type Props = {
  slug: string;
  gameName: string;
  coinMin: number;
  coinMax: number;
  dailyLimit: number;
  initialBalance: number;
  alreadyPlayedToday: boolean;
};

const SEGMENT_COUNT = 8;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;
const SPIN_DURATION_MS = 4000;
const COLORS = ["#FFC928", "#25A9E8", "#FF9F1C", "#1689D8"];
const CONFETTI_COLORS = ["#FFC928", "#FF9F1C", "#25A9E8", "#1689D8", "#fff"];

type Confetti = { id: number; dx: number; dy: number; color: string; size: number };

function buildSegments(coinMin: number, coinMax: number) {
  const step = (coinMax - coinMin) / SEGMENT_COUNT;
  return Array.from({ length: SEGMENT_COUNT }, (_, i) => {
    const from = Math.round(coinMin + step * i);
    const to = i === SEGMENT_COUNT - 1 ? coinMax : Math.round(coinMin + step * (i + 1)) - 1;
    return { from, to, label: from === to ? `${from} xu` : `${from}-${to} xu` };
  });
}

function burstConfetti(): Confetti[] {
  return Array.from({ length: 16 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
    const dist = 90 + Math.random() * 70;
    return {
      id: i,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 5,
    };
  });
}

export default function WheelGame({ slug, gameName, coinMin, coinMax, dailyLimit, initialBalance, alreadyPlayedToday }: Props) {
  const segments = useMemo(() => buildSegments(coinMin, coinMax), [coinMin, coinMax]);
  const { balance, claiming, error, done, claim } = useGamePlay(slug, initialBalance, alreadyPlayedToday);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const spinCount = useRef(0);
  const giftIconRef = useRef<HTMLSpanElement>(null);

  async function handleSpin() {
    if (spinning || done || claiming) return;
    setResult(null);
    setConfetti([]);

    const outcome = await claim();
    if (!outcome) return;

    setSpinning(true);
    const { coinsWon, newBalance } = outcome;
    const segIndex = Math.max(0, segments.findIndex((s) => coinsWon >= s.from && coinsWon <= s.to));
    const segCenter = segIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    spinCount.current += 1;
    const extraSpins = 6 + spinCount.current;
    const target = extraSpins * 360 + (360 - segCenter);

    setRotation(target);

    setTimeout(() => {
      setSpinning(false);
      setResult(coinsWon);
      setConfetti(burstConfetti());
      emitCoinsEarned(coinsWon, newBalance, giftIconRef.current);
    }, SPIN_DURATION_MS);
  }

  return (
    <div className="relative bg-white rounded-[24px] shadow-game-cardHover p-6 sm:p-10 max-w-3xl mx-auto text-center overflow-hidden">
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,169,232,0.12), transparent 70%)" }}
        aria-hidden="true"
      />

      <p className="relative text-sm text-slate-500 mb-1">Xu hiện có</p>
      <p className="relative font-display font-extrabold text-3xl text-game-primary mb-6 flex items-center justify-center gap-2">
        <i className="fa-solid fa-coins text-game-yellow" aria-hidden="true" /> {balance.toLocaleString("vi-VN")}
      </p>

      <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-8">
        {!spinning && !done && (
          <div className="absolute inset-0 rounded-full bg-game-bright animate-wheel-pulse pointer-events-none" aria-hidden="true" />
        )}

        <div
          className={`absolute left-1/2 -top-3 -translate-x-1/2 z-20 drop-shadow-md ${spinning ? "animate-pointer-tick" : ""}`}
          style={{ transformOrigin: "50% 6px" }}
          aria-hidden="true"
        >
          <div
            className="w-0 h-0 mx-auto"
            style={{ borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: "26px solid #08345F" }}
          />
          <div className="w-4 h-4 rounded-full bg-game-navy mx-auto -mt-1" />
        </div>

        <div className="absolute inset-0 rounded-full bg-game-navy shadow-2xl" aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => {
            // Tinh vi tri bang % (khong dung px co dinh) de vong chan tron luon dung
            // vi tri o CA 2 kich thuoc wheel (w-64 mobile / sm:w-80 desktop).
            const angle = (i * 22.5 - 90) * (Math.PI / 180);
            const xPct = 50 + 47 * Math.cos(angle);
            const yPct = 50 + 47 * Math.sin(angle);
            return (
              <span
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/80 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${xPct}%`, top: `${yPct}%` }}
              />
            );
          })}
        </div>

        <div
          className="absolute inset-[8px] rounded-full border-[4px] border-white shadow-xl overflow-hidden"
          style={{
            background: `conic-gradient(from 0deg, ${segments
              .map((s, i) => `${COLORS[i % COLORS.length]} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`)
              .join(", ")})`,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.72, 0.14, 1)` : "none",
          }}
        >
          {segments.map((_, i) => (
            <span
              key={`div-${i}`}
              className="absolute left-1/2 top-1/2 w-1/2 h-[2px] bg-black/10"
              style={{ transform: `rotate(${i * SEGMENT_ANGLE}deg)`, transformOrigin: "0 50%" }}
            />
          ))}
          {segments.map((s, i) => {
            // Cung dung ky thuat tinh % bang JS (khong translateY px co dinh) de
            // nhan xu luon nam dung vi tri du wheel o kich thuoc nao.
            const midAngle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
            const rad = (midAngle - 90) * (Math.PI / 180);
            const xPct = 50 + 35 * Math.cos(rad);
            const yPct = 50 + 35 * Math.sin(rad);
            return (
              <span
                key={i}
                className="absolute text-[11px] sm:text-xs font-extrabold text-game-navy drop-shadow-sm whitespace-nowrap"
                style={{ left: `${xPct}%`, top: `${yPct}%`, transform: `translate(-50%, -50%) rotate(${midAngle}deg)` }}
              >
                {s.label}
              </span>
            );
          })}
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            ref={giftIconRef}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-game-primary text-2xl ring-4 ring-game-yellow"
            style={{ background: "radial-gradient(circle at 35% 30%, #fff, #EAF7FF)" }}
          >
            <i className="fa-solid fa-gift" aria-hidden="true" />
          </span>
        </div>

        {confetti.map((c) => (
          <span
            key={c.id}
            className="absolute left-1/2 top-1/2 rounded-full animate-confetti-burst pointer-events-none"
            style={
              {
                width: c.size,
                height: c.size,
                background: c.color,
                "--dx": `${c.dx}px`,
                "--dy": `${c.dy}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {result !== null && (
        <p className="relative font-display font-bold text-lg text-brand-green mb-4 animate-fade-up" style={{ animationDuration: "0.4s" }}>
          🎉 Chúc mừng! Bạn vừa quay được <span className="text-xl">{result}</span> xu!
        </p>
      )}
      {error && <p className="relative text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2 mb-4 inline-block">{error}</p>}

      <button
        type="button"
        onClick={handleSpin}
        disabled={spinning || done || claiming}
        className="relative bg-game-primary text-white font-bold rounded-full px-8 py-3.5 hover:bg-game-deep hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-game-bright focus-visible:ring-offset-2"
      >
        {(spinning || claiming) && <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />}
        {spinning || claiming ? "Đang quay..." : done ? "Đã hết lượt hôm nay" : `Quay ngay (${dailyLimit} lượt/ngày)`}
      </button>

      {done && (
        <p className="relative text-sm text-slate-400 mt-3">
          Quay lại vào ngày mai để có thêm lượt quay {gameName.toLowerCase()} miễn phí nhé!
        </p>
      )}

      <p className="relative mt-6">
        <Link href="/game-trung-thuong" className="text-sm font-bold text-game-primary hover:underline">
          ← Quay lại danh sách game
        </Link>
      </p>
    </div>
  );
}

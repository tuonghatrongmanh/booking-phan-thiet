"use client";

import { useMemo, useRef, useState } from "react";
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

const ICONS = ["fa-umbrella-beach", "fa-fish", "fa-anchor", "fa-sailboat"];

type Card = { id: number; icon: string; flipped: boolean; matched: boolean };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  const pairs = [...ICONS, ...ICONS];
  return shuffle(pairs).map((icon, id) => ({ id, icon, flipped: false, matched: false }));
}

// Game "Tim cap hinh anh" - lat 2 la moi luot, tim du 4 cap se hoan thanh vong choi
// roi moi duoc nhan xu (xu van server random trong khoang cong khai, giong cac game
// khac - so luot lat chi la yeu to vui, khong anh huong so xu).
export default function MemoryMatchGame({ slug, gameName, dailyLimit, initialBalance, alreadyPlayedToday }: Props) {
  const { balance, claiming, error, done, claim } = useGamePlay(slug, initialBalance, alreadyPlayedToday);
  const [cards, setCards] = useState<Card[]>(() => buildDeck());
  const [firstPick, setFirstPick] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const claimBtnRef = useRef<HTMLButtonElement>(null);

  function resetGame() {
    setCards(buildDeck());
    setFirstPick(null);
    setLocked(false);
    setMoves(0);
    setFinished(false);
    setResult(null);
  }

  function flip(index: number) {
    if (locked || done) return;
    const card = cards[index];
    if (card.flipped || card.matched) return;

    const next = cards.map((c, i) => (i === index ? { ...c, flipped: true } : c));
    setCards(next);

    if (firstPick === null) {
      setFirstPick(index);
      return;
    }

    setMoves((m) => m + 1);
    const firstCard = next[firstPick];

    if (firstCard.icon === card.icon) {
      const matched = next.map((c, i) => (i === firstPick || i === index ? { ...c, matched: true } : c));
      setCards(matched);
      setFirstPick(null);
      if (matched.every((c) => c.matched)) setFinished(true);
      return;
    }

    setLocked(true);
    setTimeout(() => {
      setCards((cur) => cur.map((c, i) => (i === firstPick || i === index ? { ...c, flipped: false } : c)));
      setFirstPick(null);
      setLocked(false);
    }, 700);
  }

  async function handleClaim() {
    const outcome = await claim();
    if (!outcome) return;
    setResult(outcome.coinsWon);
    emitCoinsEarned(outcome.coinsWon, outcome.newBalance, claimBtnRef.current);
  }

  return (
    <div className="bg-white rounded-[24px] shadow-blog-card p-6 sm:p-10 max-w-2xl mx-auto text-center">
      <p className="text-sm text-slate-500 mb-1">Xu hiện có</p>
      <p className="font-display font-extrabold text-3xl text-brand-blue mb-6 flex items-center justify-center gap-2">
        <i className="fa-solid fa-coins text-amber-400" aria-hidden="true" /> {balance.toLocaleString("vi-VN")}
      </p>

      <p className="text-sm text-slate-500 mb-4">Số lượt lật: {moves}</p>

      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mb-6">
        {cards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => flip(i)}
            disabled={done}
            className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${
              c.matched
                ? "bg-brand-greenBg text-brand-green"
                : c.flipped
                ? "bg-brand-sky text-brand-blue"
                : "bg-brand-blue text-white hover:brightness-95"
            }`}
          >
            {c.flipped || c.matched ? <i className={`fa-solid ${c.icon}`} aria-hidden="true" /> : <i className="fa-solid fa-water" aria-hidden="true" />}
          </button>
        ))}
      </div>

      {finished && result === null && (
        <button
          ref={claimBtnRef}
          type="button"
          onClick={handleClaim}
          disabled={claiming}
          className="bg-brand-blue text-white font-bold rounded-full px-6 py-3 hover:brightness-95 transition disabled:opacity-50 mb-4"
        >
          {claiming ? "Đang nhận..." : "Hoàn thành! Nhận xu thưởng"}
        </button>
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

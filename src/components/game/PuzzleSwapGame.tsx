"use client";

import { useLayoutEffect, useRef, useState } from "react";
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

const GRID = 3;
const TILE_COUNT = GRID * GRID;
const IMAGE = "/uploads/news/6297738a-cc00-43f3-a4a1-26c7a91ee62b.png";

function shuffledPositions(): number[] {
  const arr = Array.from({ length: TILE_COUNT }, (_, i) => i);
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (arr.every((v, i) => v === i));
  return arr;
}

// Game "Ghep hinh du lich" - anh chia 3x3, xao vi tri cac o; click 2 o de doi cho
// nhau, ghep dung thu tu se hoan thanh. Dung anh "Suoi La Ngau" - anh du lich THAT
// duy nhat co san trong du an (khong dung anh khong lien quan).
export default function PuzzleSwapGame({ slug, gameName, dailyLimit, initialBalance, alreadyPlayedToday }: Props) {
  const { balance, claiming, error, done, claim } = useGamePlay(slug, initialBalance, alreadyPlayedToday);
  // Khoi tao THEO THU TU GOC (khong random) de HTML server render va client hydrate
  // giong nhau - xao thuc su chi lam SAU KHI mount (useLayoutEffect, chay truoc khi
  // trinh duyet ve man hinh nen nguoi dung khong thay nhap nhoang) de tranh loi
  // hydration mismatch (Math.random() cho ra 2 ket qua khac nhau o server va client).
  const [positions, setPositions] = useState<number[]>(() => Array.from({ length: TILE_COUNT }, (_, i) => i));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const claimBtnRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    setPositions(shuffledPositions());
  }, []);

  const solved = positions.every((v, i) => v === i);

  function resetGame() {
    setPositions(shuffledPositions());
    setSelected(null);
    setMoves(0);
    setResult(null);
  }

  function handleTileClick(cellIndex: number) {
    if (done || solved) return;
    if (selected === null) {
      setSelected(cellIndex);
      return;
    }
    if (selected === cellIndex) {
      setSelected(null);
      return;
    }
    setPositions((cur) => {
      const next = [...cur];
      [next[selected], next[cellIndex]] = [next[cellIndex], next[selected]];
      return next;
    });
    setMoves((m) => m + 1);
    setSelected(null);
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

      <p className="text-sm text-slate-500 mb-4">Bấm chọn 2 ô để đổi chỗ - Số lượt đổi: {moves}</p>

      <div className="grid grid-cols-3 gap-1 max-w-xs mx-auto mb-6 rounded-2xl overflow-hidden shadow-card">
        {positions.map((tileId, cellIndex) => {
          const row = Math.floor(tileId / GRID);
          const col = tileId % GRID;
          return (
            <button
              key={cellIndex}
              type="button"
              onClick={() => handleTileClick(cellIndex)}
              disabled={done || solved}
              className={`aspect-square transition-all ${selected === cellIndex ? "ring-4 ring-amber-400 z-10" : ""} ${
                solved ? "" : "hover:brightness-110"
              }`}
              style={{
                backgroundImage: `url(${IMAGE})`,
                backgroundSize: "300% 300%",
                backgroundPosition: `${col * 50}% ${row * 50}%`,
              }}
              aria-label={`Ô ${cellIndex + 1}`}
            />
          );
        })}
      </div>

      {solved && result === null && (
        <div className="mb-4">
          <p className="font-display font-bold text-brand-green mb-3">🧩 Ghép đúng rồi!</p>
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

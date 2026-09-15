"use client";

import { useState } from "react";

// Hook dung chung cho MOI mini-game: goi API /api/games/play/[slug] (server tu
// quyet dinh so xu + kiem tra gioi han/ngay, xem route do) va quan ly state ket qua.
// KHONG tu dong phat hieu ung "bay xu" o day - de tung game component tu goi
// emitCoinsEarned() dung luc no muon (VD: Vong quay doi 3.2s cho animation quay
// xong roi moi bay xu, cac game khac co the bay ngay).
export function useGamePlay(slug: string, initialBalance: number, alreadyPlayedToday: boolean) {
  const [balance, setBalance] = useState(initialBalance);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyPlayedToday);

  async function claim(): Promise<{ coinsWon: number; newBalance: number } | null> {
    if (claiming || done) return null;
    setClaiming(true);
    setError(null);

    const res = await fetch(`/api/games/play/${slug}`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setClaiming(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra, vui lòng thử lại.");
      if (res.status === 429) setDone(true);
      return null;
    }

    setBalance(data.newBalance);
    if (data.playsLeftToday <= 0) setDone(true);
    return { coinsWon: data.coinsWon, newBalance: data.newBalance };
  }

  return { balance, claiming, error, done, claim };
}

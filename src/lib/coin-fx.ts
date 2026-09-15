"use client";

// Kenh su kien don gian qua window.CustomEvent de bao HeaderCoinBadge cap nhat so
// xu + choi hieu ung "dong xu bay vao header" - dung CustomEvent thay vi Context vi
// Header va cac trang game khong chac nam trong cung 1 cay component (Header duoc
// tung page.tsx tu import rieng, khong qua 1 layout dung chung).
export type CoinsEarnedDetail = {
  amount: number;
  newBalance: number;
  sourceRect: { x: number; y: number; width: number; height: number } | null;
};

export function emitCoinsEarned(amount: number, newBalance: number, sourceEl: HTMLElement | null) {
  if (typeof window === "undefined") return;
  const r = sourceEl?.getBoundingClientRect();
  const detail: CoinsEarnedDetail = {
    amount,
    newBalance,
    sourceRect: r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null,
  };
  window.dispatchEvent(new CustomEvent<CoinsEarnedDetail>("coins-earned", { detail }));
}

// Dung khi xu thay doi ma KHONG can hieu ung bay (VD: doi thuong tru xu) - chi de
// HeaderCoinBadge cap nhat lai so cho dung, tranh hien thi lech voi DB.
export function emitCoinsChanged(newBalance: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<{ newBalance: number }>("coins-changed", { detail: { newBalance } }));
}

"use client";

import { useEffect, useState } from "react";

function formatTimeAgo(date: string) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

// "X phut truoc" phu thuoc vao Date.now() nen SSR va luc client hydrate co the ra
// 2 chuoi khac nhau (lech vai giay/phut) -> gay loi hydration mismatch. Fix: khong
// render chuoi nay trong lan render dau (server & client giong het nhau la rong),
// chi tinh va hien no SAU KHI da mount xong (useEffect, chi chay o client) - dong thoi
// tu lam moi moi 60s de label luon dung.
export default function TimeAgo({ date, className }: { date: string; className?: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(formatTimeAgo(date));
    const id = setInterval(() => setLabel(formatTimeAgo(date)), 60_000);
    return () => clearInterval(id);
  }, [date]);

  return <span className={className} suppressHydrationWarning>{label ?? ""}</span>;
}

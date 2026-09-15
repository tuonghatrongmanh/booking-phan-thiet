"use client";

import { useEffect, useState } from "react";

function timeLeftToMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Dem nguoc that toi 0h hom nay (tinh lai moi giay tren client) - the hien "uu dai hom nay"
// mot cach trung thuc, khong bia dat mot khung gio khuyen mai gia.
export default function StayCountdownBadge() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(timeLeftToMidnight());
    const id = setInterval(() => setLabel(timeLeftToMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="font-bold text-[#EF4444] tabular-nums">{label ?? "--:--:--"}</span>;
}

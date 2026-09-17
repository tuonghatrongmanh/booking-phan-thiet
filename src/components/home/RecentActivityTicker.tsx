"use client";

import { useEffect, useState } from "react";
import type { ActivityItem } from "@/lib/recent-activity-feed";

const SHOW_MS = 5000;
const HIDE_GAP_MS = 800;

// Widget "hoat dong gan day" o goc trai man hinh - tu hien tung item 1, nghi 1 chut
// roi qua item ke tiep, lap vong quanh. Nguoi dung co the bam X de tat han (luu vao
// sessionStorage, khong hien lai trong tab hien tai - dung "tat = tat het" chu khong
// phai "seen once" nhu bug da gap voi SaleStandingGate).
export default function RecentActivityTicker({ items }: { items: ActivityItem[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("activity-ticker-dismissed") === "1") setDismissed(true);
    } catch {
      // ignore - private browsing co the chan sessionStorage
    }
  }, []);

  useEffect(() => {
    if (items.length === 0 || dismissed) return;
    let timeoutId: ReturnType<typeof setTimeout>;

    const showTimer = setTimeout(() => setVisible(true), 1500);

    function cycle() {
      timeoutId = setTimeout(() => {
        setVisible(false);
        timeoutId = setTimeout(() => {
          setIndex((i) => (i + 1) % items.length);
          setVisible(true);
          cycle();
        }, HIDE_GAP_MS);
      }, SHOW_MS);
    }
    cycle();

    return () => {
      clearTimeout(showTimer);
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, dismissed]);

  if (items.length === 0 || dismissed) return null;
  const item = items[index];

  function handleDismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem("activity-ticker-dismissed", "1");
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={`fixed bottom-5 left-4 z-40 max-w-[calc(100vw-2rem)] sm:max-w-sm transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3">
        <span className="shrink-0 w-9 h-9 rounded-full bg-brand-sky flex items-center justify-center text-brand-blue">
          <i className={item.icon} aria-hidden="true" />
        </span>
        <p className="text-[13px] text-slate-700 leading-snug flex-1 min-w-0">{item.text}</p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Đóng"
          className="shrink-0 text-slate-300 hover:text-slate-500 transition"
        >
          <i className="fa-solid fa-xmark text-sm" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

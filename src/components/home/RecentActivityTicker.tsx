"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ActivityItem } from "@/lib/recent-activity-feed";
import { armNotificationSound, playNotificationChime } from "@/lib/notification-sound";
import { setPref, usePrefs } from "@/lib/client-prefs";

const SHOW_MS = 2600;
const HIDE_GAP_MS = 400;

function formatActivityTime(date: Date): string {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `ngày ${day}/${month} ${hh}:${mm}`;
}

// Widget "hoat dong gan day" o goc trai man hinh - tu hien tung item 1, nghi 1 chut
// roi qua item ke tiep, lap vong quanh, chu ky ~3s de tao cam giac soi dong. Nguoi
// dung co the bam X de tat han (luu vao sessionStorage, khong hien lai trong tab hien
// tai - dung "tat = tat het" chu khong phai "seen once" nhu bug da gap voi SaleStandingGate).
export default function RecentActivityTicker({ items }: { items: ActivityItem[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // Công tắc âm thanh chung của khách (Cài đặt trong menu) - đổi ở đâu cũng đồng bộ
  const muted = !usePrefs().sound;

  useEffect(() => {
    armNotificationSound();
  }, []);

  // Moi lan toast hien ra (va khi vua bat lai tieng - nghe thu) thi phat tieng ting
  useEffect(() => {
    if (visible && !muted && !dismissed) playNotificationChime();
  }, [visible, muted, dismissed]);

  function toggleMuted() {
    setPref("sound", muted);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (sessionStorage.getItem("activity-ticker-dismissed") === "1") setDismissed(true);
      } catch {
        // ignore - private browsing co the chan sessionStorage
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (items.length === 0 || dismissed) return;
    let timeoutId: ReturnType<typeof setTimeout>;

    const showTimer = setTimeout(() => setVisible(true), 1200);

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
      className={`fixed bottom-3 left-2 sm:bottom-5 sm:left-4 z-40 max-w-[66vw] sm:max-w-sm transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <div
        key={item.id}
        className="flex items-center gap-2 sm:gap-3 bg-gradient-to-br from-brand-tint to-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-brand-blueMid px-2.5 py-2 sm:px-4 sm:py-3"
      >
        <span className="relative shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-brand-blue/40">
          <Image src={item.avatar} alt="" fill className="object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] rounded-full bg-brand-blue text-white flex items-center justify-center text-[7px] sm:text-[9px] ring-2 ring-white">
            <i className={item.icon} aria-hidden="true" />
          </span>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] sm:text-[13px] text-slate-700 leading-tight sm:leading-snug line-clamp-2 sm:line-clamp-none">
            <strong className="font-bold text-slate-800">{item.name}</strong> {item.action}
          </p>
          <p className="hidden sm:block text-[11px] text-slate-400 mt-0.5">{formatActivityTime(item.createdAt)}</p>
        </div>
        <div className="shrink-0 self-start flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Đóng"
            className="text-slate-300 hover:text-slate-500 transition"
          >
            <i className="fa-solid fa-xmark text-sm" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={toggleMuted}
            aria-label={muted ? "Bật âm thanh thông báo" : "Tắt âm thanh thông báo"}
            title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
            aria-pressed={muted}
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[11px] transition ${
              muted ? "bg-slate-100 text-slate-400 hover:text-slate-600" : "bg-brand-sky text-brand-blue hover:bg-brand-blueMid"
            }`}
          >
            <i className={muted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high"} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NotificationItem = {
  id: string;
  type: "warning" | "system" | "unread" | "important" | "message";
  title: string;
  description: string;
  href: string;
  createdAt: string;
};

const TYPE_DOT: Record<NotificationItem["type"], string> = {
  warning: "bg-brand-red",
  system: "bg-brand-green",
  unread: "bg-amber-400",
  important: "bg-brand-purple",
  message: "bg-brand-blue",
};

const SEEN_KEY = "bpt_admin_notifications_seen_at";

function timeAgo(iso: string): string {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  return `${Math.floor(diffHour / 24)} ngày trước`;
}

export default function AdminNotifications() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((d) => {
        const list: NotificationItem[] = d.items ?? [];
        setItems(list);
        const seenAt = Number(localStorage.getItem(SEEN_KEY) ?? "0");
        setUnreadCount(list.filter((n) => new Date(n.createdAt).getTime() > seenAt).length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function markAllRead() {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
    setUnreadCount(0);
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition"
        aria-label="Thông báo"
      >
        <i className="fa-regular fa-bell text-slate-500 text-lg" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-brand-red text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="font-bold text-sm text-slate-800">Thông báo</p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-semibold text-brand-blue hover:underline">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-none">
            {items.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 text-center">Chưa có thông báo nào.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    router.push(n.href);
                    setOpen(false);
                  }}
                  className="w-full text-left flex items-start gap-2.5 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition"
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${TYPE_DOT[n.type]}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{n.title}</p>
                    <p className="text-xs text-slate-400 truncate">{n.description}</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

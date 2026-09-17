"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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

const SEEN_KEY = "bpt_user_notifications_seen_at";

function timeAgo(iso: string): string {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  return `${Math.floor(diffHour / 24)} ngày trước`;
}

export default function UserNotificationBell({
  avatar,
  name,
  warned,
}: {
  avatar: string;
  name: string | null;
  warned: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        const list: NotificationItem[] = d.items ?? [];
        setItems(list);
        let seenAt = 0;
        try {
          seenAt = Number(window.localStorage.getItem(SEEN_KEY) ?? "0");
        } catch {
          seenAt = 0;
        }
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
    try {
      window.localStorage.setItem(SEEN_KEY, String(Date.now()));
    } catch {
      // localStorage không khả dụng - bỏ qua, không làm vỡ tính năng chính
    }
    setUnreadCount(0);
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        className="relative flex items-center shrink-0"
        aria-label="Thông báo & tài khoản"
      >
        <Image
          src={avatar}
          alt={name || "Tài khoản"}
          width={40}
          height={40}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white/70 hover:ring-white transition"
        />
        {warned && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-red text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white"
            aria-label="Tài khoản có cảnh báo từ quản trị viên"
          >
            !
          </span>
        )}
        {!warned && unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-red text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="font-bold text-sm text-slate-800">Thông báo</p>
            <Link href="/tai-khoan" onClick={() => setOpen(false)} className="text-xs font-semibold text-brand-blue hover:underline">
              Trang tài khoản
            </Link>
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

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

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
  saleProfileId = null,
  partnerCount = 0,
}: {
  avatar: string;
  name: string | null;
  warned: boolean;
  saleProfileId?: string | null;
  partnerCount?: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
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
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Mở khung tài khoản: khóa cuộn trang phía sau, Esc để đóng
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

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
        aria-label="Tài khoản của tôi và thông báo"
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

      {mounted &&
        createPortal(
          <>
            <div
              className={`fixed inset-0 z-[70] bg-black/45 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Tài khoản của tôi"
              inert={!open}
              className={`fixed inset-y-0 right-0 z-[71] w-[86vw] max-w-[380px] bg-white shadow-[-12px_0_32px_rgba(0,30,80,0.3)] flex flex-col transition-transform duration-300 ease-out ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="bg-navbar-gradient text-white px-5 pt-5 pb-4 shrink-0">
                <div className="flex items-start justify-between">
                  <Image src={avatar} alt="" width={64} height={64} className="w-16 h-16 rounded-full object-cover ring-2 ring-white/70" />
                  <button type="button" onClick={() => setOpen(false)} aria-label="Đóng" className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center">
                    <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
                  </button>
                </div>
                <p className="font-display font-bold text-xl mt-2.5 truncate">{name || "Tài khoản"}</p>
                <p className="text-sm text-white/80">{saleProfileId ? "Sale uy tín" : "Thành viên"}</p>
              </div>

              <div className="px-4 py-3 space-y-2 shrink-0 border-b border-slate-100">
                <Link
                  href={saleProfileId ? `/sale/${saleProfileId}` : "/tai-khoan"}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-brand-blue text-white px-4 py-3 font-bold hover:brightness-95 transition"
                >
                  <i className={`fa-solid ${saleProfileId ? "fa-id-badge" : "fa-user"} w-5 text-center`} aria-hidden="true" />
                  <span className="flex-1">{saleProfileId ? "Hồ sơ Sale của tôi" : "Trang cá nhân"}</span>
                  <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
                </Link>
                {partnerCount > 0 && (
                  <Link
                    href="/doi-tac"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-amber-50 text-amber-800 px-4 py-2.5 text-sm font-bold hover:bg-amber-100 transition"
                  >
                    <i className="fa-solid fa-handshake w-5 text-center" aria-hidden="true" /> Cổng đối tác
                  </Link>
                )}
                {saleProfileId && (
                  <Link
                    href="/tai-khoan"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-brand-tint text-brand-blue px-4 py-2.5 text-sm font-bold hover:bg-brand-sky transition"
                  >
                    <i className="fa-solid fa-gear w-5 text-center" aria-hidden="true" /> Thông tin tài khoản
                  </Link>
                )}
              </div>

              <p className="px-5 pt-3 pb-1 font-bold text-sm text-slate-800 shrink-0">Thông báo</p>
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
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
                      className="w-full text-left flex items-start gap-3 px-5 py-3 border-b border-slate-50 hover:bg-slate-50 transition"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${TYPE_DOT[n.type]}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700">{n.title}</p>
                        <p className="text-xs text-slate-400 truncate">{n.description}</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="p-4 shrink-0 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-300 text-slate-600 font-bold py-2.5 hover:bg-slate-50 transition"
                >
                  <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Đăng xuất
                </button>
              </div>
            </aside>
          </>,
          document.body
        )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  fromName: string;
};

function timeAgo(iso: string): string {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  return `${Math.floor(diffHour / 24)} ngày trước`;
}

// Tu danh dau da doc cho tung tin nhan chua doc khi hien trong danh sach (khong can
// bam gi ca) - danh dau "da xem" dung dung nghia vi day la trang xem chi tiet, khac
// voi bell thong bao chung (chi la preview, khong tinh la "da doc" that).
export default function AdminMessagesInbox({ messages: initial }: { messages: Message[] }) {
  const [messages, setMessages] = useState(initial);

  useEffect(() => {
    const unread = initial.filter((m) => !m.read);
    if (unread.length === 0) return;
    unread.forEach((m) => {
      fetch(`/api/admin/messages/${m.id}`, { method: "PATCH" }).catch(() => {});
    });
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-400">
        <i className="fa-regular fa-envelope-open text-3xl mb-2 block" aria-hidden="true" />
        Bạn chưa có tin nhắn nào.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card divide-y divide-slate-100">
      {messages.map((m) => (
        <div key={m.id} className={`flex items-start gap-3 p-4 sm:p-5 ${!m.read ? "bg-brand-sky/10" : ""}`}>
          <span className="shrink-0 w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center">
            <i className="fa-solid fa-user-shield" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-slate-700">{m.fromName}</p>
              {!m.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-red" aria-hidden="true" />}
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-line mt-0.5">{m.message}</p>
            <p className="text-xs text-slate-300 mt-1">{timeAgo(m.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";

// Liên hệ khách 1 chạm ngay trên dòng đơn: Zalo (mở đúng cuộc trò chuyện theo số điện
// thoại), gọi điện, và sao chép sẵn tin nhắn mẫu để dán vào Zalo/SMS.
export default function CustomerContact({
  name,
  phone,
  email,
  message,
}: {
  name: string;
  phone: string;
  email?: string | null;
  message: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Sao chép tin nhắn:", message);
    }
  }

  const btn = "text-[11px] font-bold rounded-md px-2 py-1 border transition";

  return (
    <div>
      <p className="font-semibold text-slate-700">{name}</p>
      <p className="text-xs text-slate-400">{phone}</p>
      {email && <p className="text-xs text-slate-400 break-all">{email}</p>}
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        <a
          href={`https://zalo.me/${phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} border-brand-blue text-brand-blue hover:bg-brand-sky/30`}
        >
          Zalo
        </a>
        <a href={`tel:${phone}`} className={`${btn} border-slate-200 text-slate-600 hover:bg-slate-50`}>
          Gọi
        </a>
        <button type="button" onClick={copyMessage} className={`${btn} border-slate-200 text-slate-600 hover:bg-slate-50`}>
          {copied ? "Đã chép tin nhắn" : "Chép tin nhắn"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

type MessageRow = { id: string; message: string; read: boolean; createdAt: string };

function timeAgo(iso: string): string {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  return `${Math.floor(diffHour / 24)} ngày trước`;
}

export default function StaffMessageCard({ staffId, history }: { staffId: string; history: MessageRow[] }) {
  const router = useRouter();
  const { toast } = useDialog();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    const res = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toAdminId: staffId, message: text.trim() }),
    });
    setSending(false);
    if (!res.ok) {
      toast("Không thể gửi tin nhắn", "error");
      return;
    }
    setText("");
    toast("Đã gửi tin nhắn", "success");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <p className="font-bold text-slate-700 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-envelope text-brand-blue" aria-hidden="true" /> Tin nhắn riêng
      </p>
      <p className="text-xs text-slate-400 mb-4">Gửi thông báo/nhắc nhở riêng cho nhân viên này, chỉ họ xem được.</p>

      <div className="flex gap-2 mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Nhập nội dung tin nhắn..."
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="shrink-0 self-end bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-4 py-2.5 disabled:opacity-50"
        >
          {sending ? "Đang gửi..." : "Gửi"}
        </button>
      </div>

      {history.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-none">
          <p className="text-xs font-semibold text-slate-500">Lịch sử đã gửi ({history.length})</p>
          {history.map((m) => (
            <div key={m.id} className="bg-slate-50 rounded-xl p-3">
              <p className="text-sm text-slate-700 whitespace-pre-line">{m.message}</p>
              <p className="text-[11px] text-slate-300 mt-1">
                {timeAgo(m.createdAt)} {m.read && <span className="text-brand-green">· Đã xem</span>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

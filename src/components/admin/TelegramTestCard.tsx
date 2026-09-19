"use client";

import { useEffect, useState } from "react";

// Kiểm tra cảnh báo Telegram có chạy được trên server THẬT không. Biến môi trường
// (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID) phải được đặt trong Render, không phải chỉ trong
// file .env trên máy - nếu thiếu thì mọi cảnh báo (đơn mới, khách báo chuyển cọc, bảo mật)
// đều im lặng chứ không báo lỗi.
export default function TelegramTestCard({ hasToken, hasChatId }: { hasToken: boolean; hasChatId: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "fail">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [hook, setHook] = useState<{ active: boolean; lastError: string | null } | null>(null);
  const [hookBusy, setHookBusy] = useState(false);
  const [hookMessage, setHookMessage] = useState<string | null>(null);

  async function loadHook() {
    const res = await fetch("/api/admin/telegram-webhook");
    if (res.ok) setHook(await res.json());
  }
  useEffect(() => {
    const t = setTimeout(() => void loadHook(), 0);
    return () => clearTimeout(t);
  }, []);

  async function enableHook() {
    setHookBusy(true);
    setHookMessage(null);
    const res = await fetch("/api/admin/telegram-webhook", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setHookBusy(false);
    setHookMessage(res.ok ? "Đã bật! Từ giờ tin báo đơn có nút bấm xác nhận cọc ngay trong Telegram." : typeof data.error === "string" ? data.error : "Không bật được, thử lại nhé.");
    if (res.ok) void loadHook();
  }

  async function send() {
    setState("sending");
    setMessage(null);
    const res = await fetch("/api/admin/telegram-test", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (data.sent) {
      setState("ok");
      setMessage("Đã gửi! Hãy kiểm tra Telegram của bạn - nếu thấy tin nhắn nghĩa là cảnh báo đã hoạt động.");
    } else {
      setState("fail");
      setMessage(typeof data.error === "string" ? data.error : "Gửi thất bại, vui lòng thử lại.");
    }
  }

  const ready = hasToken && hasChatId;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="font-display font-bold text-lg text-slate-800">Cảnh báo Telegram</h2>
      <p className="text-sm text-slate-400 mb-4">
        Báo về điện thoại khi có đơn đặt phòng/thuê xe mới, khi khách báo đã chuyển cọc và khi có sự kiện bảo mật nghiêm trọng.
      </p>

      <ul className="text-sm space-y-1 mb-4">
        <li className={hasToken ? "text-brand-green" : "text-brand-red"}>
          {hasToken ? "✓" : "✗"} TELEGRAM_BOT_TOKEN {hasToken ? "đã có trên server" : "CHƯA có trên server"}
        </li>
        <li className={hasChatId ? "text-brand-green" : "text-brand-red"}>
          {hasChatId ? "✓" : "✗"} TELEGRAM_CHAT_ID {hasChatId ? "đã có trên server" : "CHƯA có trên server"}
        </li>
      </ul>
      {!ready && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-4">
          Thêm biến còn thiếu ở Render → chọn dịch vụ → Environment → Add Environment Variable, rồi đợi deploy lại xong và tải lại trang này.
        </p>
      )}

      <button
        type="button"
        onClick={send}
        disabled={state === "sending"}
        className="bg-brand-blue text-white font-bold rounded-xl px-5 py-2.5 text-sm disabled:opacity-60"
      >
        {state === "sending" ? "Đang gửi..." : "Gửi tin Telegram thử"}
      </button>
      {message && (
        <p className={`mt-3 text-sm ${state === "ok" ? "text-brand-green" : "text-brand-red"}`}>{message}</p>
      )}

      <div className="mt-6 pt-5 border-t border-slate-100">
        <h3 className="font-bold text-slate-800">Nút xác nhận cọc ngay trong Telegram</h3>
        <p className="text-sm text-slate-400 mb-3">
          Khi khách đặt cọc hoặc báo đã chuyển khoản, tin Telegram có nút “Đã nhận cọc” / “Chưa nhận được”. Bạn xem app ngân hàng rồi bấm ngay trên điện thoại (có bước xác nhận lần 2 để tránh bấm nhầm).
        </p>
        <p className={`text-sm mb-3 ${hook?.active ? "text-brand-green" : "text-slate-500"}`}>
          {hook === null ? "Đang kiểm tra..." : hook.active ? "✓ Đang bật" : "✗ Chưa bật"}
          {hook?.lastError ? ` - Telegram báo lỗi gần nhất: ${hook.lastError}` : ""}
        </p>
        <button
          type="button"
          onClick={enableHook}
          disabled={hookBusy || !ready}
          className="bg-brand-blue text-white font-bold rounded-xl px-5 py-2.5 text-sm disabled:opacity-60"
        >
          {hookBusy ? "Đang bật..." : hook?.active ? "Bật lại / làm mới" : "Bật nút xác nhận"}
        </button>
        {hookMessage && <p className="mt-3 text-sm text-slate-600">{hookMessage}</p>}
        <p className="mt-3 text-xs text-slate-400">Nếu bạn nhận tin trong một NHÓM Telegram (không phải chat riêng với bot), thêm biến TELEGRAM_ADMIN_USER_IDS (id Telegram của những người được bấm, cách nhau bằng dấu phẩy) vào Render.</p>
      </div>
    </div>
  );
}

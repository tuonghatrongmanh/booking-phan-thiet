"use client";

import { createPortal } from "react-dom";
import { useState } from "react";
import { useDialog } from "@/components/ui/DialogProvider";

export type SecurityLogDetail = {
  id: string;
  ip: string;
  path: string;
  method: string;
  userAgent: string | null;
  reason: string | null;
  severity: string | null;
  resolved: boolean;
  country: string | null;
  city: string | null;
  adminEmail: string | null;
  adminName: string | null;
  createdAt: string;
};

const SEVERITY_LABEL: Record<string, string> = { high: "Cao", medium: "Trung bình", low: "Thấp" };

export default function SecurityLogDrawer({
  log,
  onClose,
  onResolved,
  onFilterByIp,
}: {
  log: SecurityLogDetail;
  onClose: () => void;
  onResolved: () => void;
  onFilterByIp: (ip: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const { confirm, toast } = useDialog();

  async function blockIp() {
    const warning = log.adminEmail
      ? `⚠️ CẢNH BÁO: request này đến từ phiên đăng nhập admin "${log.adminName || log.adminEmail}" (${log.adminEmail}). Nếu đây là chính bạn (hoặc đồng nghiệp), chặn IP sẽ khiến chính bạn không vào được website.

`
      : "";
    if (!(await confirm({ message: `${warning}Chặn IP ${log.ip}? IP này sẽ không thể truy cập website nữa.`, danger: true }))) return;
    setBusy(true);
    try {
      await fetch("/api/admin/blocked-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: log.ip, reason: log.reason }),
      });
      toast(`Đã chặn IP ${log.ip}`, "success");
    } finally {
      setBusy(false);
    }
  }

  async function markResolved() {
    setBusy(true);
    try {
      await fetch(`/api/admin/security-logs/${log.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: true }),
      });
      onResolved();
    } finally {
      setBusy(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-display font-bold text-lg text-slate-800">Chi tiết cảnh báo</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                log.severity === "high"
                  ? "text-brand-red bg-brand-redBg"
                  : log.severity === "medium"
                    ? "text-brand-orange bg-amber-50"
                    : "text-brand-green bg-brand-greenBg"
              }`}
            >
              Mức độ: {SEVERITY_LABEL[log.severity ?? ""] ?? "Thấp"}
            </span>
            <span className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString("vi-VN")}</span>
          </div>

          {log.adminEmail ? (
            <div className="flex items-center gap-2 bg-brand-tint text-brand-blue text-xs font-bold px-3 py-2 rounded-xl">
              <i className="fa-solid fa-user-shield" aria-hidden="true" />
              Request từ phiên admin: {log.adminName || log.adminEmail} ({log.adminEmail})
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 text-slate-500 text-xs font-bold px-3 py-2 rounded-xl">
              <i className="fa-solid fa-user-secret" aria-hidden="true" />
              Không có phiên admin đăng nhập (ẩn danh)
            </div>
          )}

          {[
            { label: "IP", value: log.ip },
            { label: "Vị trí", value: [log.country, log.city].filter(Boolean).join(" · ") || "Không xác định" },
            { label: "Method", value: log.method },
            { label: "Endpoint", value: log.path },
            { label: "User Agent", value: log.userAgent || "—" },
            { label: "Request ID", value: log.id },
            { label: "Lý do", value: log.reason || "—" },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</p>
              <p className="text-sm text-slate-700 break-all">{f.value}</p>
            </div>
          ))}

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Trạng thái</p>
            <span
              className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                log.resolved ? "text-brand-green bg-brand-greenBg" : "text-brand-red bg-brand-redBg"
              }`}
            >
              {log.resolved ? "ĐÃ XỬ LÝ" : "CHƯA XỬ LÝ"}
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={blockIp}
              disabled={busy}
              className="bg-brand-red text-white text-sm font-bold rounded-xl py-2.5 hover:brightness-95 transition disabled:opacity-50"
            >
              <i className="fa-solid fa-ban mr-1.5" aria-hidden="true" /> Chặn IP
            </button>
            {!log.resolved && (
              <button
                type="button"
                onClick={markResolved}
                disabled={busy}
                className="bg-brand-green text-white text-sm font-bold rounded-xl py-2.5 hover:brightness-95 transition disabled:opacity-50"
              >
                <i className="fa-solid fa-check mr-1.5" aria-hidden="true" /> Đánh dấu đã xử lý
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onFilterByIp(log.ip);
                onClose();
              }}
              className="border border-slate-200 text-slate-600 text-sm font-bold rounded-xl py-2.5 hover:bg-slate-50 transition"
            >
              <i className="fa-solid fa-list mr-1.5" aria-hidden="true" /> Xem toàn bộ request từ IP này
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

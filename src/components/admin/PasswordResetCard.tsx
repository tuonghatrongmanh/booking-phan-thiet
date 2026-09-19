"use client";

import { useState } from "react";
import MasterPasswordGate from "@/components/admin/MasterPasswordGate";
import { useDialog } from "@/components/ui/DialogProvider";

export default function PasswordResetCard({ resetUrl, label }: { resetUrl: string; label: string }) {
  const { toast } = useDialog();
  const [showGate, setShowGate] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  async function handleConfirm(masterPassword: string) {
    const res = await fetch(resetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: typeof data.error === "string" ? data.error : "Có lỗi xảy ra" };
    }
    setShowGate(false);
    setNewPassword(data.newPassword);
  }

  async function copyPassword() {
    if (!newPassword) return;
    try {
      await navigator.clipboard.writeText(newPassword);
      toast("Đã sao chép mật khẩu mới", "success");
    } catch {
      toast("Không thể sao chép, hãy chọn thủ công", "error");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <p className="font-bold text-slate-700 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-key text-brand-blue" aria-hidden="true" /> Đặt lại mật khẩu {label}
      </p>
      <p className="text-xs text-slate-400 mb-4">
        Không thể xem lại mật khẩu cũ (được mã hóa một chiều) — chỉ có thể đặt một mật khẩu mới và xem nó một lần duy nhất.
      </p>

      {newPassword ? (
        <div className="bg-brand-sky/30 border border-brand-blueMid rounded-xl p-4 space-y-2">
          <p className="text-xs text-slate-500">Mật khẩu mới (chỉ hiện 1 lần — hãy gửi ngay cho tài khoản này):</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-base font-bold text-slate-800 bg-white rounded-lg px-3 py-2 border border-slate-200">
              {newPassword}
            </code>
            <button
              onClick={copyPassword}
              className="text-sm font-bold text-brand-blue border border-brand-blueMid hover:bg-brand-tint rounded-lg px-3 py-2 shrink-0"
            >
              Sao chép
            </button>
          </div>
          <button onClick={() => setNewPassword(null)} className="text-xs text-slate-400 hover:text-slate-600">
            Đóng
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowGate(true)}
          className="text-sm font-bold text-white bg-brand-blue hover:brightness-95 transition rounded-lg px-4 py-2.5"
        >
          Đặt lại mật khẩu
        </button>
      )}

      {showGate && (
        <MasterPasswordGate
          title={`Đặt lại mật khẩu ${label}`}
          onSubmit={handleConfirm}
          onClose={() => setShowGate(false)}
        />
      )}
    </div>
  );
}

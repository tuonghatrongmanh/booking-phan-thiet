"use client";

import { useState } from "react";

// Modal nhap mat khau chu de xac nhan lai truoc hanh dong nhay cam (dat lai mat khau
// Sale/Nhan vien). Khong tao session/token rieng - onSubmit tu goi API hanh dong thuc
// su voi mat khau chu vua nhap, don gian va an toan hon (moi request tu xac thuc lai).
export default function MasterPasswordGate({
  title,
  onSubmit,
  onClose,
}: {
  title: string;
  onSubmit: (masterPassword: string) => Promise<{ error?: string } | void>;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await onSubmit(value);
    setSubmitting(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-3"
      >
        <p className="font-display font-bold text-slate-800">{title}</p>
        <p className="text-xs text-slate-400">Nhập mật khẩu chủ (chỉ SuperAdmin biết) để xác nhận.</p>
        <input
          autoFocus
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Mật khẩu chủ"
        />
        {error && <p className="text-xs text-brand-red">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={!value || submitting}
            className="flex-1 bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-4 py-2.5 disabled:opacity-60"
          >
            {submitting ? "Đang xác nhận..." : "Xác nhận"}
          </button>
          <button type="button" onClick={onClose} className="text-slate-500 font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

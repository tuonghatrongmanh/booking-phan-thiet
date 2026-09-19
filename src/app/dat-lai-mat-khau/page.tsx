"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Liên kết không hợp lệ, vui lòng yêu cầu lại từ đầu.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Co loi xay ra, vui long thu lai");
      return;
    }
    setDone(true);
  }

  return (
    <div className="relative min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <Link
        href="/dang-nhap"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5 bg-white/80 hover:bg-brand-blue transition-colors rounded-full pl-2.5 pr-4 py-2 text-sm font-bold text-brand-blue hover:text-white shadow"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M11 19l-7-7 7-7M4 12h16" />
        </svg>
        Về đăng nhập
      </Link>

      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md animate-pop-in">
        <div className="flex flex-col items-center mb-6">
          <Image src="/images/logo-dark.png" alt="Booking Phan Thiết" width={220} height={64} className="mb-3 w-[190px] h-auto" />
          <h1 className="font-display font-bold text-xl text-slate-800">Đặt lại mật khẩu</h1>
        </div>

        {done ? (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-brand-greenBg text-brand-green flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-check" aria-hidden="true" />
            </div>
            <p className="text-sm text-slate-600">Mật khẩu đã được đặt lại thành công.</p>
            <Link href="/dang-nhap" className="inline-block bg-brand-blue text-white font-bold rounded-xl px-6 py-2.5 mt-2">
              Đăng nhập ngay
            </Link>
          </div>
        ) : !token ? (
          <div className="text-center space-y-3">
            <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">
              Liên kết không hợp lệ hoặc đã hết hạn.
            </p>
            <Link href="/quen-mat-khau" className="inline-block text-brand-blue font-bold hover:underline">
              Yêu cầu liên kết mới
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-password" className="text-[13px] text-slate-500 font-medium mb-1 block">Mật khẩu mới</label>
              <input
                id="reset-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                placeholder="Ít nhất 8 ký tự"
              />
            </div>
            <div>
              <label htmlFor="reset-password-confirm" className="text-[13px] text-slate-500 font-medium mb-1 block">Nhập lại mật khẩu mới</label>
              <input
                id="reset-password-confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl py-3 disabled:opacity-60"
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}

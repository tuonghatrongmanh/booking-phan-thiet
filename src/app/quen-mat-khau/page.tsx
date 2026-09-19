"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
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
          <h1 className="font-display font-bold text-xl text-slate-800">Quên mật khẩu</h1>
          <p className="text-sm text-slate-400 text-center mt-1">
            Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu
          </p>
        </div>

        {done ? (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-brand-greenBg text-brand-green flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-envelope-circle-check" aria-hidden="true" />
            </div>
            <p className="text-sm text-slate-600">
              Nếu email <strong>{email}</strong> tồn tại trong hệ thống, một liên kết đặt lại mật khẩu đã được gửi tới
              hòm thư của bạn. Kiểm tra cả mục Spam nếu không thấy.
            </p>
            <p className="text-xs text-slate-400">
              Không nhận được email sau vài phút? Liên hệ admin qua Zalo/hotline để được hỗ trợ trực tiếp.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="text-[13px] text-slate-500 font-medium mb-1 block">Email</label>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                placeholder="ban@email.com"
              />
            </div>

            {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl py-3 disabled:opacity-60"
            >
              {loading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function VerifyForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
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
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5 bg-white/80 hover:bg-brand-blue transition-colors rounded-full pl-2.5 pr-4 py-2 text-sm font-bold text-brand-blue hover:text-white shadow"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M11 19l-7-7 7-7M4 12h16" />
        </svg>
        Về trang chủ
      </Link>

      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md animate-pop-in text-center">
        <div className="flex flex-col items-center mb-6">
          <Image src="/images/logo.png" alt="Booking Phan Thiết" width={90} height={90} className="mb-2" />
          <h1 className="font-display font-bold text-xl text-slate-800">Xác thực email</h1>
        </div>

        {done ? (
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-full bg-brand-greenBg text-brand-green flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-check" aria-hidden="true" />
            </div>
            <p className="text-sm text-slate-600">Email của bạn đã được xác thực thành công.</p>
            <Link href="/tai-khoan" className="inline-block bg-brand-blue text-white font-bold rounded-xl px-6 py-2.5 mt-2">
              Về trang tài khoản
            </Link>
          </div>
        ) : !token ? (
          <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">Liên kết không hợp lệ.</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Bấm nút bên dưới để xác thực email cho tài khoản của bạn.</p>
            {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl py-3 disabled:opacity-60"
            >
              {loading ? "Đang xác thực..." : "Xác thực email"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}

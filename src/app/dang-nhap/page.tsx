"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl") || "/";
  const callbackUrl = (() => {
    if (typeof window === "undefined") return rawCallbackUrl;
    try {
      const u = new URL(rawCallbackUrl, window.location.origin);
      return u.pathname + u.search + u.hash;
    } catch {
      return rawCallbackUrl;
    }
  })();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("user-credentials", { email, password, redirect: false });

    setLoading(false);

    if (res?.error) {
      setError("Email hoặc mật khẩu không đúng");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
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

      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md animate-pop-in">
        <div className="flex flex-col items-center mb-6">
          <Image src="/images/logo.png" alt="Booking Phan Thiết" width={90} height={90} className="mb-2" />
          <h1 className="font-display font-bold text-xl text-slate-800">Đăng nhập</h1>
          <p className="text-sm text-slate-400">Booking Phan Thiết</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="ban@email.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[13px] text-slate-500 font-medium block">Mật khẩu</label>
              <Link href="/quen-mat-khau" className="text-[12px] text-brand-blue font-semibold hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-xs text-slate-400 font-medium">hoặc</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full flex items-center justify-center gap-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition rounded-xl py-2.5 font-semibold text-slate-600"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.85z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z" />
          </svg>
          Đăng nhập với Google
        </button>

        <p className="text-center text-sm text-slate-500 mt-5">
          Chưa có tài khoản?{" "}
          <Link href="/dang-ky" className="text-brand-blue font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function UserLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

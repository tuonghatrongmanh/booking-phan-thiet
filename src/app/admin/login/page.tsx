"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function LoginSkeleton() {
  return (
    <div className="min-h-dvh bg-hero-gradient flex items-center justify-center px-4 py-20">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md animate-pulse">
        <div className="flex flex-col items-center mb-6">
          <div className="w-[90px] h-[90px] rounded-2xl bg-slate-200 mb-3" />
          <div className="h-5 w-44 rounded-full bg-slate-200 mb-2" />
          <div className="h-3.5 w-32 rounded-full bg-slate-100" />
        </div>
        <div className="space-y-4">
          <div>
            <div className="h-3 w-16 rounded-full bg-slate-100 mb-2" />
            <div className="h-11 w-full rounded-xl bg-slate-100" />
          </div>
          <div>
            <div className="h-3 w-20 rounded-full bg-slate-100 mb-2" />
            <div className="h-11 w-full rounded-xl bg-slate-100" />
          </div>
          <div className="h-12 w-full rounded-xl bg-slate-200 mt-2" />
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl") || "/admin";
  const callbackUrl = (() => {
    if (typeof window === "undefined") return rawCallbackUrl;
    try {
      const u = new URL(rawCallbackUrl, window.location.origin);
      return u.pathname + u.search + u.hash;
    } catch {
      return rawCallbackUrl;
    }
  })();

  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needsOtp, setNeedsOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 550);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!needsOtp) {
      setLoading(true);
      const res = await fetch("/api/admin/login-precheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Email hoặc mật khẩu không đúng");
        return;
      }

      if (data.requiresTwoFactor) {
        setNeedsOtp(true);
        return;
      }
    }

    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      otp: needsOtp ? otp : undefined,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      if (res.code === "rate_limited") {
        setError("Bạn nhập sai quá nhiều lần, vui lòng đợi 5 phút rồi thử lại.");
      } else if (res.code === "invalid_otp") {
        setError("Mã 2FA không đúng hoặc đã hết hạn. Hãy nhập mã mới đang hiện trên app.");
      } else if (res.error === "CredentialsSignin") {
        setError(needsOtp ? "Mã 2FA không đúng hoặc đã hết hạn." : "Email hoặc mật khẩu không đúng");
      } else {
        // Lỗi KHÔNG phải sai mã/mật khẩu (thường do cookie cũ/tiện ích trình duyệt chặn) - hiện
        // mã lỗi thật để dễ xử lý thay vì báo nhầm là sai mã 2FA.
        setError(`Không đăng nhập được do lỗi phiên (mã: ${res.error}). Hãy xóa cookie của trang này hoặc thử cửa sổ ẩn danh.`);
      }
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  if (!ready) return <LoginSkeleton />;

  return (
    <div className="relative min-h-dvh bg-hero-gradient flex items-center justify-center px-4 py-20">
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5 bg-white/80 hover:bg-brand-blue transition-colors rounded-full pl-2.5 pr-4 py-2 text-sm font-bold text-brand-blue hover:text-white shadow"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M11 19l-7-7 7-7M4 12h16" />
        </svg>
        <span>Về trang chủ</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md animate-pop-in">
        <div className="flex flex-col items-center mb-6">
          <Image src="/images/logo-dark.png" alt="Booking Phan Thiết" width={220} height={64} className="mb-3 w-[190px] h-auto" />
          <h1 className="font-display font-bold text-xl text-slate-800">Đăng nhập quản trị</h1>
          <p className="text-sm text-slate-400">Booking Phan Thiết Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {needsOtp ? (
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mã xác thực 2 lớp</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                placeholder="000000"
                maxLength={6}
              />
              <p className="text-xs text-slate-400 mt-1.5">Nhập mã 6 số từ ứng dụng Google Authenticator (hoặc tương tự).</p>
              <button
                type="button"
                onClick={() => {
                  setNeedsOtp(false);
                  setOtp("");
                  setError(null);
                }}
                className="text-xs text-brand-blue font-semibold hover:underline mt-1.5"
              >
                Quay lại
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tài khoản</label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                  placeholder="Tên đăng nhập"
                />
              </div>
              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mật khẩu</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                  placeholder="••••••••"
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl py-3 disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : needsOtp ? "Xác nhận" : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

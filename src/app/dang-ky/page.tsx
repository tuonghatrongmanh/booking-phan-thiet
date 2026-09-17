"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, dob, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }

    const signInRes = await signIn("user-credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      router.push("/dang-nhap");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-10">
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
          <Image src="/images/logo.png" alt="Booking Phan Thiết" width={80} height={80} className="mb-2" />
          <h1 className="font-display font-bold text-xl text-slate-800">Đăng ký tài khoản</h1>
          <p className="text-sm text-slate-400">Tham gia cộng đồng du lịch Phan Thiết</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="text-[13px] text-slate-500 font-medium mb-1 block">Họ và tên</label>
            <input
              id="register-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label htmlFor="register-phone" className="text-[13px] text-slate-500 font-medium mb-1 block">Số điện thoại</label>
            <input
              id="register-phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="0912345678"
            />
          </div>
          <div>
            <label htmlFor="register-email" className="text-[13px] text-slate-500 font-medium mb-1 block">Email</label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="ban@email.com"
            />
          </div>
          <div>
            <label htmlFor="register-dob" className="text-[13px] text-slate-500 font-medium mb-1 block">Ngày sinh</label>
            <input
              id="register-dob"
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            />
          </div>
          <div>
            <label htmlFor="register-password" className="text-[13px] text-slate-500 font-medium mb-1 block">Mật khẩu</label>
            <input
              id="register-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="Ít nhất 8 ký tự"
            />
          </div>
          <div>
            <label htmlFor="register-confirm-password" className="text-[13px] text-slate-500 font-medium mb-1 block">Nhập lại mật khẩu</label>
            <input
              id="register-confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Đã có tài khoản?{" "}
          <Link href="/dang-nhap" className="text-brand-blue font-bold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

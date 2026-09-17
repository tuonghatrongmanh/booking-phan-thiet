"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function AdminAccountMenu({ userName }: { userName?: string | null }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition">
        <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shrink-0">
          {(userName || "A").charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:block text-left">
          <span className="block text-sm font-bold text-slate-700 leading-tight">{userName || "Admin"}</span>
          <span className="block text-[11px] text-slate-400 leading-tight">Quản trị viên</span>
        </span>
        <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 hidden sm:block" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 p-2">
          <Link
            href="/admin/account"
            onClick={() => setOpen(false)}
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <i className="fa-regular fa-id-card w-4" aria-hidden="true" /> Thông tin tài khoản
          </Link>
          <Link
            href="/admin/account"
            onClick={() => setOpen(false)}
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <i className="fa-solid fa-gear w-4" aria-hidden="true" /> Cài đặt
          </Link>
          <a
            href="/admin#hoat-dong"
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <i className="fa-solid fa-clock-rotate-left w-4" aria-hidden="true" /> Nhật ký hoạt động
          </a>
          <div className="border-t border-slate-100 my-1.5" />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-brand-red hover:bg-brand-redBg transition"
          >
            <i className="fa-solid fa-arrow-right-from-bracket w-4" aria-hidden="true" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

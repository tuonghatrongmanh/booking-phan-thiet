"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { NAV_LINKS } from "./HeaderNav";
import ClientSettingsPanel from "./ClientSettingsPanel";

export type NavAccount = { name: string; avatar: string; saleProfileId: string | null };

// Menu mobile dang drawer truot tu TRAI SANG PHAI (khong phai do xuong tu tren), chi
// chiem mot nua man hinh, luon nam trong DOM (khong unmount) de transition transform
// muot ma; dung chung mau gradient cua header cho drawer.
export default function MobileNavToggle({ account }: { account: NavAccount | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Đóng menu" : "Mở menu"}
        aria-expanded={open}
        className="flex items-center justify-center w-10 h-10 rounded-[10px] text-white hover:bg-white/10 active:bg-white/15 transition-colors"
      >
        <i className="fa-solid fa-bars text-xl" aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-label="Đóng menu"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 cursor-default transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 w-1/2 min-w-[240px] max-w-[360px] bg-navbar-gradient shadow-[8px_0_24px_rgba(0,40,80,0.25)] flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-[72px] px-4 shrink-0 border-b border-white/15">
          <Image
            src="/images/logo.png"
            alt="Booking Phan Thiết"
            width={200}
            height={58}
            className="w-[128px] h-auto object-contain select-none"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:bg-white/15 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
        {/* Thẻ tài khoản to, rõ chữ - người lớn tuổi nhìn là biết bấm vào đâu để vào trang cá nhân */}
        <div className="px-3 pt-3">
          {account ? (
            <Link
              href={account.saleProfileId ? `/sale/${account.saleProfileId}` : "/tai-khoan"}
              className="flex items-center gap-3 rounded-2xl bg-white text-slate-800 p-3 shadow-lg active:scale-[0.99] transition"
            >
              <Image src={account.avatar} alt="" width={48} height={48} className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-blue/30 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Tài khoản của tôi</span>
                <span className="block font-bold text-[15px] truncate">{account.name}</span>
                <span className="block text-xs font-semibold text-brand-blue">
                  {account.saleProfileId ? "Xem hồ sơ Sale của tôi" : "Xem trang cá nhân"} <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
                </span>
              </span>
            </Link>
          ) : (
            <Link href="/dang-nhap" className="flex items-center justify-center gap-2 rounded-2xl bg-white text-brand-blue font-bold py-3 shadow-lg">
              <i className="fa-solid fa-user" aria-hidden="true" /> Đăng nhập / Đăng ký
            </Link>
          )}
          {account && account.saleProfileId && (
            <Link href="/tai-khoan" className="mt-2 block text-center text-sm font-semibold text-white/90 underline underline-offset-2">
              Thông tin tài khoản &amp; mật khẩu
            </Link>
          )}
        </div>

        <nav className="px-3 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-[10px] text-[15px] font-bold transition-colors ${
                  isActive ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/8 hover:text-white"
                }`}
              >
                <i className={`${link.icon} text-[18px] w-5 text-center`} aria-hidden="true" />
                {link.label}
                {link.hot && (
                  <span className="animate-badge-bounce ml-auto bg-[#FF4D4F] text-white text-[10px] font-extrabold px-[6px] py-[1px] rounded-[5px] leading-[14px]">
                    HOT
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        </div>

        <div className="shrink-0 border-t border-white/15 px-4 py-3">
          <ClientSettingsPanel tone="dark" />
          {account && (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-full border border-white/40 text-white text-sm font-bold py-2 hover:bg-white/10"
            >
              <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Đăng xuất
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./HeaderNav";
import ClientSettingsPanel from "./ClientSettingsPanel";


// Menu mobile dang drawer truot tu TRAI SANG PHAI (khong phai do xuong tu tren), chi
// chiem mot nua man hinh, luon nam trong DOM (khong unmount) de transition transform
// muot ma; dung chung mau gradient cua header cho drawer.
export default function MobileNavToggle() {
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
        className={`fixed inset-y-0 left-0 z-50 w-[72vw] min-w-[240px] max-w-[320px] bg-navbar-gradient shadow-[8px_0_24px_rgba(0,40,80,0.25)] flex flex-col transition-transform duration-300 ease-out ${
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

        <div className="flex-1 min-h-0 overflow-y-auto">
        <nav className="px-3 py-2 flex flex-col gap-0.5">
          {NAV_LINKS.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[15px] font-bold transition-colors ${
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

        {/* Cài đặt luôn hiện đủ ở đáy menu: gọn 2 công tắc (ngôn ngữ có nút nhỏ ở đầu trang) */}
        <div className="shrink-0 border-t border-white/15 px-4 pt-2 pb-3">
          <ClientSettingsPanel tone="dark" compact />
        </div>
      </div>
    </div>
  );
}

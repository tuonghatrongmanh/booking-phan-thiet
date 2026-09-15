"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LOCALES, LOCALE_INFO, type Locale } from "@/lib/i18n/translations";
import { ICONS } from "@/lib/emoji";
import { NAV_LINKS } from "./HeaderNav";

const FLAG_ICON: Record<Locale, string> = {
  vi: ICONS.vnFlag,
  en: ICONS.usFlag,
  es: ICONS.esFlag,
  fr: ICONS.frFlag,
  zh: ICONS.cnFlag,
  ja: ICONS.jpFlag,
  ko: ICONS.krFlag,
};

// Menu mobile dang drawer truot tu TRAI SANG PHAI (khong phai do xuong tu tren), chi
// chiem mot nua man hinh, luon nam trong DOM (khong unmount) de transition transform
// muot ma; dung chung mau gradient cua header cho drawer.
export default function MobileNavToggle() {
  const pathname = usePathname();
  const { locale, translate, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function pickLocale(code: Locale) {
    setLocale(code);
  }

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
            width={120}
            height={120}
            className="w-14 h-auto object-contain select-none"
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

        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            const label = translate(link.id, link.label);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-[10px] text-[15px] font-bold transition-colors ${
                  isActive ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/8 hover:text-white"
                }`}
              >
                <i className={`${link.icon} text-[18px] w-5 text-center`} aria-hidden="true" />
                {label}
                {link.hot && (
                  <span className="animate-badge-bounce ml-auto bg-[#FF4D4F] text-white text-[10px] font-extrabold px-[6px] py-[1px] rounded-[5px] leading-[14px]">
                    {translate("common.hot", "HOT")}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Doi ngon ngu (Google dich toan trang) - chi hien o day vi header an
            LanguageSwitcher duoi breakpoint sm, drawer nay la noi duy nhat man hinh
            nho co the doi ngon ngu. */}
        <div className="shrink-0 border-t border-white/15 px-3 py-3">
          <p className="text-[11px] font-bold text-white/50 uppercase tracking-wide px-2 mb-1.5">
            {translate("common.language", "Ngôn ngữ")}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {LOCALES.map((code) => {
              const info = LOCALE_INFO[code];
              const active = code === locale;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => pickLocale(code)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    active ? "bg-white/20 text-white" : "text-white/75 hover:bg-white/10"
                  }`}
                >
                  <img src={FLAG_ICON[code]} alt="" width={14} height={14} />
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

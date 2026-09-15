"use client";

import { useEffect, useRef, useState } from "react";
import { ICONS } from "@/lib/emoji";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LOCALES, LOCALE_INFO, type Locale } from "@/lib/i18n/translations";

const FLAG_ICON: Record<Locale, string> = {
  vi: ICONS.vnFlag,
  en: ICONS.usFlag,
  es: ICONS.esFlag,
  fr: ICONS.frFlag,
  zh: ICONS.cnFlag,
  ja: ICONS.jpFlag,
  ko: ICONS.krFlag,
};

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = LOCALE_INFO[locale];

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition rounded-lg px-2.5 py-1.5 text-white text-sm font-semibold"
      >
        <img src={FLAG_ICON[locale]} alt="" width={16} height={16} />
        {current.label}
        <i className={`fa-solid fa-chevron-down text-[9px] ml-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl ring-1 ring-black/5 py-1.5 z-50 animate-fade-up"
          style={{ animationDuration: "0.18s" }}
        >
          {LOCALES.map((code) => {
            const info = LOCALE_INFO[code];
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={code === locale}
                onClick={() => {
                  setLocale(code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition text-left ${
                  code === locale ? "bg-brand-sky text-brand-blue font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <img src={FLAG_ICON[code]} alt="" width={18} height={18} />
                {info.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

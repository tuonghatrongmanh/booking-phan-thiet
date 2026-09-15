"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { LOCALES, TRANSLATIONS, type Locale } from "./translations";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translate: (id: string, fallback: ReactNode) => ReactNode;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const COOKIE_NAME = "bpt_locale";

function readCookieLocale(): Locale | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1] as Locale | undefined;
  return value && (LOCALES as readonly string[]).includes(value) ? value : null;
}

// Chuyen ngu client-side, KHONG doi URL (/nghi-duong giu nguyen o moi ngon ngu).
// Mac dinh la Tieng Viet (chu VI nam thang trong JSX qua children cua <T>), sau khi
// mount se doc cookie da luu de nho lua chon lan truoc - nhip render dau tien luon la
// VI (tranh sai lech giua server/client gay loi hydration), chuyen ngu that su xay ra
// ngay sau do trong 1 lan cap nhat, khong can F5.
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    const saved = readCookieLocale();
    if (saved) setLocaleState(saved);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=31536000`;
  }, []);

  const translate = useCallback(
    (id: string, fallback: ReactNode): ReactNode => {
      if (locale === "vi") return fallback;
      return TRANSLATIONS[locale]?.[id] ?? fallback;
    },
    [locale]
  );

  return <LanguageContext.Provider value={{ locale, setLocale, translate }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage() phải được gọi bên trong <LanguageProvider>");
  return ctx;
}

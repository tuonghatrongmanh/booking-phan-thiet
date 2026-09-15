"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { TRANSLATIONS } from "@/lib/i18n/translations";

// placeholder can chuoi string thuan (khong the dung <T> vi no tra ve ReactNode) nen
// tach rieng thanh 1 client component nho de doc ban dich truc tiep tu dictionary.
export default function FooterNewsletterInput() {
  const { locale } = useLanguage();
  const placeholder = locale === "vi" ? "Nhập email của bạn" : (TRANSLATIONS[locale]?.["footer.newsletter.placeholder"] ?? "Nhập email của bạn");

  return (
    <input
      type="email"
      placeholder={placeholder}
      className="flex-1 min-w-0 px-3 py-2.5 text-sm text-slate-800 focus:outline-none"
    />
  );
}

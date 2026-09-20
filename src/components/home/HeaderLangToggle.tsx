"use client";

import { setPref, usePrefs } from "@/lib/client-prefs";

// Nút ngôn ngữ tròn nhỏ ở đầu trang (không chiếm chỗ): hiện mã của NGÔN NGỮ SẼ ĐỔI SANG - đang tiếng Việt
// thì hiện "EN" (bấm là chuyển sang English), đang English thì hiện "VI". Có hiệu lực ngay trên toàn web.
export default function HeaderLangToggle() {
  const lang = usePrefs().lang;
  const next = lang === "vi" ? "en" : "vi";
  return (
    <button
      type="button"
      onClick={() => setPref("lang", next)}
      translate="no"
      aria-label={next === "en" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
      title={next === "en" ? "English" : "Tiếng Việt"}
      className="shrink-0 w-8 h-8 rounded-full border-2 border-white/60 text-white text-[11px] font-extrabold leading-none flex items-center justify-center hover:bg-white/15 active:bg-white/25 transition"
    >
      {next.toUpperCase()}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePrefs } from "@/lib/client-prefs";
import { startTranslator } from "@/lib/translate-engine";

// Dịch toàn bộ chữ trên website sang tiếng Anh khi khách chọn English (Cài đặt trong menu). Chạy sau khi
// trang hydrate xong để không làm lệch với React; khu vực admin luôn giữ tiếng Việt.
export default function SiteTranslator() {
  const lang = usePrefs().lang;
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const enabled = lang === "en" && !pathname.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;
    let stop: (() => void) | undefined;
    // đợi trang tải + hydrate xong (tránh sửa chữ trước khi React gắn vào)
    const t = setTimeout(() => {
      stop = startTranslator(setBusy);
    }, document.readyState === "complete" ? 700 : 1800);
    return () => {
      clearTimeout(t);
      stop?.();
    };
  }, [enabled]);

  if (!enabled || !busy) return null;
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-slate-900/85 text-white text-xs font-semibold rounded-full px-4 py-2 shadow-lg flex items-center gap-2"
      role="status"
      data-no-translate
    >
      <i className="fa-solid fa-language" aria-hidden="true" /> Translating to English…
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { promptInstall, usePwaInstall } from "@/lib/pwa-install";

const DISMISS_KEY = "bpt_install_dismissed_v1";
const RESHOW_AFTER_MS = 14 * 24 * 60 * 60 * 1000;

function recentlyDismissed(): boolean {
  try {
    const t = Number(localStorage.getItem(DISMISS_KEY));
    return Boolean(t) && Date.now() - t < RESHOW_AFTER_MS;
  } catch {
    return false;
  }
}

// Thanh mời cài ứng dụng: chỉ hiện trên điện thoại, sau ~25 giây, 1 lần / 14 ngày, đóng được.
export default function InstallAppBanner() {
  const pathname = usePathname();
  const { canPrompt, installed, ios } = usePwaInstall();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const t = setTimeout(() => {
      setDismissed(recentlyDismissed());
      setReady(true);
    }, 25000);
    return () => clearTimeout(t);
  }, []);

  if (!ready || dismissed || installed || pathname.startsWith("/admin")) return null;
  if (!canPrompt && !ios) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setDismissed(true);
  }

  async function install() {
    if (canPrompt) {
      const r = await promptInstall();
      if (r !== "unavailable") dismiss();
    } else {
      setShowIosHelp((v) => !v);
    }
  }

  return (
    <div role="dialog" aria-label="Cài ứng dụng Booking Phan Thiết" className="fixed z-[60] left-3 right-[72px] bottom-3 rounded-2xl bg-brand-blue text-white shadow-2xl px-3 py-2.5 border border-white/20">
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/favicon-192.png" alt="" width={40} height={40} className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold leading-tight truncate">Cài ứng dụng</p>
          <p className="text-[11px] text-white/75 leading-tight truncate">Mở nhanh như app</p>
        </div>
        <button type="button" onClick={install} className="shrink-0 bg-[#FFD23F] text-brand-blue font-extrabold text-[13px] rounded-full px-3.5 py-1.5">
          Cài
        </button>
        <button type="button" onClick={dismiss} aria-label="Đóng" className="shrink-0 w-6 h-6 text-white/70 text-lg leading-none">
          ×
        </button>
      </div>
      {showIosHelp && (
        <p className="mt-2 text-[12px] leading-snug text-white/90 border-t border-white/20 pt-2">
          Bấm nút <b>Chia sẻ</b> <i className="fa-solid fa-arrow-up-from-bracket" aria-hidden="true" /> ở thanh Safari, kéo xuống chọn <b>&ldquo;Thêm vào Màn hình chính&rdquo;</b>.
        </p>
      )}
    </div>
  );
}

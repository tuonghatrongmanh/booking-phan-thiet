"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type PopupData = { id: string; title: string | null; image: string; href: string | null };

const SESSION_KEY_PREFIX = "bpt_popup_seen_";

// Hien 1 lan / phien trinh duyet cho moi popup (theo id) khi khach vao website lan
// dau - dung sessionStorage de khong lam phien khi chuyen trang trong cung 1 phien.
// Tu an tren cac trang /admin (trang quan tri, khong phai khach xem).
export default function PopupModal() {
  const pathname = usePathname();
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    let cancelled = false;
    fetch("/api/popups?active=true")
      .then((r) => r.json())
      .then((list: PopupData[]) => {
        if (cancelled || !Array.isArray(list) || list.length === 0) return;
        const p = list[0];
        const seenKey = `${SESSION_KEY_PREFIX}${p.id}`;
        if (sessionStorage.getItem(seenKey)) return;
        setPopup(p);
        setVisible(true);
        sessionStorage.setItem(seenKey, "1");
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!popup || !visible || pathname?.startsWith("/admin")) return null;

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={popup.image} alt={popup.title ?? ""} className="max-w-full max-h-[80dvh] rounded-2xl shadow-2xl object-contain" />
  );

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-5 animate-fade-up"
      style={{ animationDuration: "200ms" }}
      onClick={() => setVisible(false)}
    >
      <div className="relative max-w-lg w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Đóng"
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white text-slate-700 shadow-lg flex items-center justify-center hover:bg-slate-100 transition z-10"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        {popup.href ? (
          <a href={popup.href} target="_blank" rel="noopener noreferrer">
            {image}
          </a>
        ) : (
          image
        )}
      </div>
    </div>
  );
}

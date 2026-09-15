"use client";

import { useEffect, useState } from "react";

// Nhan "path" (duong dan tuong doi, vd /tin-tuc/slug) thay vi URL tuyet doi - tu ghep
// voi window.location.origin phia client de link chia se luon dung domain that dang
// chay (localhost khi dev, domain that khi len production), khong hard-code domain.
export default function ShareButtons({ path, title }: { path: string; title: string }) {
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin + path);
  }, [path]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // trinh duyet khong ho tro Clipboard API - bo qua, nut van hien binh thuong
    }
  }

  const iconBtn = "w-10 h-10 rounded-full flex items-center justify-center transition-colors";

  return (
    <div className="flex items-center gap-2.5">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chia sẻ lên Facebook"
        className={`${iconBtn} bg-[#1877F2] text-white hover:brightness-95`}
      >
        <i className="fa-brands fa-facebook-f" aria-hidden="true" />
      </a>
      <a
        href={`https://sp.zalo.me/share?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chia sẻ qua Zalo"
        className={`${iconBtn} bg-[#0068FF] text-white hover:brightness-95`}
      >
        <i className="fa-solid fa-comment-dots" aria-hidden="true" />
      </a>
      <button
        type="button"
        onClick={copyLink}
        aria-label="Sao chép liên kết"
        className={`${iconBtn} border border-slate-200 text-slate-500 hover:bg-slate-50`}
      >
        <i className={copied ? "fa-solid fa-check text-brand-green" : "fa-solid fa-link"} aria-hidden="true" />
      </button>
      {copied && <span className="text-xs font-semibold text-brand-green">Đã sao chép!</span>}
    </div>
  );
}

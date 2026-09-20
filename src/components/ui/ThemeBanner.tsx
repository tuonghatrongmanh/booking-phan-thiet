"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

// Dải thông báo mỏng ở đầu trang theo giao diện lễ hội (vd "Chúc mừng năm mới - Ưu đãi Tết đến 30%"). Khách bấm × để ẩn.
export default function ThemeBanner({ text }: { text: string }) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  if (hidden || pathname.startsWith("/admin")) return null;
  return (
    <div
      className="relative z-[45] text-center text-white text-[13px] sm:text-sm font-semibold px-10 py-1.5"
      style={{ background: "linear-gradient(90deg, var(--theme-navbar-from), var(--theme-navbar-via), var(--theme-navbar-to))" }}
    >
      {text}
      <button type="button" onClick={() => setHidden(true)} aria-label="Ẩn thông báo" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 text-white/80 hover:text-white text-lg leading-none">
        ×
      </button>
    </div>
  );
}

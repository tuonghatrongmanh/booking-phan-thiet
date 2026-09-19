"use client";

import { useEffect, useRef, useState } from "react";
import ClientSettingsPanel from "@/components/home/ClientSettingsPanel";

// Nút bánh răng trên thanh menu máy tính (điện thoại dùng mục Cài đặt cuối menu hamburger)
export default function HeaderSettingsButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative hidden xl:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Cài đặt (âm thanh, trợ lý AI, ngôn ngữ)"
        aria-expanded={open}
        className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition"
      >
        <i className="fa-solid fa-gear text-lg" aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4">
          <ClientSettingsPanel tone="light" />
        </div>
      )}
    </div>
  );
}

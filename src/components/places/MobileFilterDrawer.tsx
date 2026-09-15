"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

// StayFilterSidebar toan la <Link> (dieu huong server, khong phai form submit) nen
// bam vao bat ky muc loc nao se tu dong dieu huong trang - dung su kien click noi bot
// tren the <a> de tu dong dong drawer, khong can can thiep vao tung Link rieng le.
//
// QUAN TRONG: modal phai render qua createPortal vao document.body. Neu component
// nay nam trong 1 <Reveal> (dung transform: translateY de tao hieu ung hien dan khi
// cuon), phan tu cha se tao "containing block" moi cho moi con position:fixed ben
// trong no (dung theo spec CSS bat ky khi nao co transform khac none) - khi do modal
// "fixed inset-0" se bi nhot trong khung cua Reveal thay vi bam theo toan bo viewport
// that su, hien sai vi tri (da gap dung loi nay voi menu mobile o header truoc do).
export default function MobileFilterDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm shrink-0"
      >
        <i className="fa-solid fa-sliders" aria-hidden="true" />
        Bộ lọc
      </button>

      <div className="hidden lg:block">{children}</div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div
              className="relative bg-slate-50 rounded-t-2xl max-h-[85vh] overflow-y-auto p-4 pb-24 animate-fade-up"
              style={{ animationDuration: "200ms" }}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) setOpen(false);
              }}
            >
              {children}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="fixed bottom-4 left-4 right-4 z-10 bg-brand-blue text-white font-bold rounded-xl py-3 shadow-lg"
            >
              Xong
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

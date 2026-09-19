"use client";

import { useEffect } from "react";

// global-error.tsx thay the CA root layout khi loi xay ra ngoai pham vi error.tsx
// thong thuong (vd loi ngay trong layout.tsx) - Next.js yeu cau phai co the <html>/<body>
// rieng vi no khong con duoc boc trong layout goc nua.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="bg-slate-50 text-slate-800 antialiased">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-slate-100">
            <h1 className="font-bold text-xl text-slate-800 mb-2">Đã có lỗi xảy ra</h1>
            <p className="text-sm text-slate-500 mb-6">
              Rất xin lỗi vì sự bất tiện này. Vui lòng thử lại sau ít phút.
            </p>
            <button
              type="button"
              onClick={reset}
              className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
            >
              Thử lại
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

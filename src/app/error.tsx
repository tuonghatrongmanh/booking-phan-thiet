"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-card p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-brand-redBg text-brand-red flex items-center justify-center mx-auto mb-4 text-2xl">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
        </div>
        <h1 className="font-display font-bold text-xl text-slate-800 mb-2">Đã có lỗi xảy ra</h1>
        <p className="text-sm text-slate-500 mb-6">
          Rất xin lỗi vì sự bất tiện này. Bạn có thể thử lại hoặc về trang chủ.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="border border-slate-200 hover:bg-slate-50 transition text-slate-600 font-bold rounded-xl px-5 py-2.5"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

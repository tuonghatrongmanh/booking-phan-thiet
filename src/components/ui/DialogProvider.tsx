"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; message: string; type: ToastType };

type DialogContextValue = {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  toast: (message: string, type?: ToastType) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

const TOAST_STYLE: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: "bg-brand-green", icon: "fa-solid fa-circle-check" },
  error: { bg: "bg-brand-red", icon: "fa-solid fa-circle-exclamation" },
  info: { bg: "bg-brand-blue", icon: "fa-solid fa-circle-info" },
};

// Thay the window.confirm/alert bang popup + toast chuyen nghiep dung chung toan site -
// mount 1 lan o RootLayout (src/app/layout.tsx). Dung Promise cho confirm() de giu duoc
// cach goi "if (!(await confirm(...))) return;" giong window.confirm cu, khong phai sua
// lai toan bo logic goi noi o tung noi dang dung.
export default function DialogProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const confirm = useCallback((options: ConfirmOptions | string) => {
    const opts = typeof options === "string" ? { message: options } : options;
    return new Promise<boolean>((resolve) => {
      setPending({ ...opts, resolve });
    });
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  function resolvePending(result: boolean) {
    pending?.resolve(result);
    setPending(null);
  }

  return (
    <DialogContext.Provider value={{ confirm, toast }}>
      {children}

      {mounted &&
        createPortal(
          <>
            {pending && (
              <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => resolvePending(false)} />
                <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${
                      pending.danger ? "bg-red-50 text-brand-red" : "bg-brand-sky text-brand-blue"
                    }`}
                  >
                    <i className={pending.danger ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-circle-question"} aria-hidden="true" />
                  </div>
                  {pending.title && <p className="font-display font-bold text-lg text-slate-800 mb-1.5">{pending.title}</p>}
                  <p className="text-slate-500 text-[15px] leading-relaxed mb-6">{pending.message}</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => resolvePending(false)}
                      className="flex-1 bg-slate-100 text-slate-600 font-bold rounded-xl px-4 py-2.5 text-sm hover:bg-slate-200 transition"
                    >
                      {pending.cancelText ?? "Hủy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => resolvePending(true)}
                      className={`flex-1 text-white font-bold rounded-xl px-4 py-2.5 text-sm transition hover:brightness-95 ${
                        pending.danger ? "bg-brand-red" : "bg-brand-blue"
                      }`}
                    >
                      {pending.confirmText ?? "Xác nhận"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="fixed bottom-5 right-5 z-[2100] flex flex-col gap-2.5 items-end">
              {toasts.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-2.5 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg max-w-sm animate-fade-up ${TOAST_STYLE[t.type].bg}`}
                >
                  <i className={TOAST_STYLE[t.type].icon} aria-hidden="true" />
                  <span>{t.message}</span>
                </div>
              ))}
            </div>
          </>,
          document.body
        )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog phải được gọi bên trong <DialogProvider>");
  return ctx;
}

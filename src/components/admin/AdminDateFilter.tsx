"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const PRESETS = [
  { value: "today", label: "Hôm nay" },
  { value: "yesterday", label: "Hôm qua" },
  { value: "7d", label: "7 ngày qua" },
  { value: "30d", label: "30 ngày qua" },
  { value: "this-month", label: "Tháng này" },
  { value: "last-month", label: "Tháng trước" },
  { value: "custom", label: "Tùy chỉnh" },
];

export default function AdminDateFilter({ currentLabel }: { currentLabel: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(searchParams.get("from") ?? "");
  const [customTo, setCustomTo] = useState(searchParams.get("to") ?? "");
  const [showCustom, setShowCustom] = useState(false);

  function applyPreset(value: string) {
    if (value === "custom") {
      setShowCustom(true);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    params.delete("from");
    params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", "custom");
    params.set("from", customFrom);
    params.set("to", customTo);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
    setShowCustom(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition whitespace-nowrap"
      >
        <i className="fa-regular fa-calendar text-slate-400" aria-hidden="true" />
        {currentLabel}
        <i className="fa-solid fa-chevron-down text-[10px] text-slate-400" aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setShowCustom(false); }} />
          <div className="absolute right-0 top-full mt-1.5 z-50 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 p-2">
            {!showCustom ? (
              PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => applyPreset(p.value)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  {p.label}
                </button>
              ))
            ) : (
              <div className="p-2 space-y-2">
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Từ ngày</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">Đến ngày</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={applyCustom}
                    className="flex-1 bg-brand-blue text-white text-xs font-bold rounded-lg py-1.5 hover:brightness-95"
                  >
                    Áp dụng
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustom(false)}
                    className="flex-1 text-slate-500 text-xs font-bold rounded-lg py-1.5 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

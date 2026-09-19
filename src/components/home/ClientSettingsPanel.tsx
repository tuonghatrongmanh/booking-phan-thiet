"use client";

import { setPref, usePrefs } from "@/lib/client-prefs";

// Cài đặt dành cho khách (đặt cuối menu hamburger và trong nút bánh răng trên máy tính): công tắc lớn,
// chữ rõ, dễ thao tác cho người lớn tuổi. Lưu trên thiết bị, có hiệu lực ngay.
function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${on ? "bg-brand-green" : "bg-slate-400/70"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

export default function ClientSettingsPanel({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const prefs = usePrefs();
  const dark = tone === "dark";
  const row = `flex items-center gap-3 py-2.5 ${dark ? "text-white" : "text-slate-700"}`;
  const sub = dark ? "text-white/60" : "text-slate-400";

  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${dark ? "text-white/60" : "text-slate-400"}`}>
        <i className="fa-solid fa-gear mr-1.5" aria-hidden="true" /> Cài đặt
      </p>

      <div className={row}>
        <i className={`fa-solid ${prefs.sound ? "fa-volume-high" : "fa-volume-xmark"} w-5 text-center text-lg`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold leading-tight">Âm thanh</p>
          <p className={`text-xs ${sub}`}>{prefs.sound ? "Đang bật" : "Đang tắt"}</p>
        </div>
        <Switch on={prefs.sound} onChange={(v) => setPref("sound", v)} label="Bật hoặc tắt âm thanh" />
      </div>

      <div className={row}>
        <i className="fa-solid fa-robot w-5 text-center text-lg" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold leading-tight">Trợ lý AI</p>
          <p className={`text-xs ${sub}`}>{prefs.ai ? "Đang hiện" : "Đang ẩn"}</p>
        </div>
        <Switch on={prefs.ai} onChange={(v) => setPref("ai", v)} label="Hiện hoặc ẩn trợ lý AI" />
      </div>

      <div className={`${row} !items-start`}>
        <i className="fa-solid fa-language w-5 text-center text-lg mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold leading-tight mb-1.5">Ngôn ngữ / Language</p>
          <div className="flex gap-2">
            {(
              [
                ["vi", "Tiếng Việt"],
                ["en", "English"],
              ] as const
            ).map(([code, label]) => (
              <button
                key={code}
                type="button"
                onClick={() => setPref("lang", code)}
                aria-pressed={prefs.lang === code}
                translate="no"
                className={`flex-1 rounded-full px-3 py-1.5 text-sm font-bold border transition ${
                  prefs.lang === code
                    ? dark
                      ? "bg-white text-brand-blue border-white"
                      : "bg-brand-blue text-white border-brand-blue"
                    : dark
                      ? "border-white/40 text-white hover:bg-white/10"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

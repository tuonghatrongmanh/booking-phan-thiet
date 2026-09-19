"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import { useDialog } from "@/components/ui/DialogProvider";
import { UI_SLOTS, type UiSlotId, type UiSlotMap } from "@/lib/ui-slots-registry";

const MODE_LABEL = { button: "Thay cả nút", icon: "Thay biểu tượng", image: "Thay ảnh" } as const;

export default function UiSlotsManager({ initial }: { initial: UiSlotMap }) {
  const { toast, confirm } = useDialog();
  const [slots, setSlots] = useState<UiSlotMap>(initial);
  const [busy, setBusy] = useState<UiSlotId | null>(null);

  async function upload(slot: UiSlotId, url: string) {
    setBusy(slot);
    const res = await fetch(`/api/admin/ui-slots/${slot}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Không lưu được", "error");
      return;
    }
    setSlots((cur) => ({ ...cur, [slot]: url }));
    toast("Đã thay - khách thấy ở lần tải trang kế tiếp", "success");
  }

  async function reset(slot: UiSlotId, label: string) {
    const ok = await confirm({ title: "Khôi phục mặc định?", message: `Bỏ ảnh tùy chỉnh của “${label}” và dùng lại hình gốc?`, confirmText: "Khôi phục" });
    if (!ok) return;
    setBusy(slot);
    const res = await fetch(`/api/admin/ui-slots/${slot}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) {
      toast("Không khôi phục được", "error");
      return;
    }
    setSlots((cur) => {
      const next = { ...cur };
      delete next[slot];
      return next;
    });
    toast("Đã khôi phục mặc định", "success");
  }

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {UI_SLOTS.map((s) => {
        const url = slots[s.id];
        return (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="font-display font-bold text-slate-800">{s.label}</p>
              <span className="shrink-0 text-[11px] font-bold text-brand-blue bg-brand-sky rounded-full px-2 py-0.5">{MODE_LABEL[s.mode]}</span>
            </div>
            <p className="text-xs text-slate-400 mb-1">Vị trí: {s.where}</p>
            <p className="text-xs text-slate-500 mb-3">{s.hint}</p>

            <div className="flex items-start gap-4">
              <div className="w-24 h-24 shrink-0 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-[11px] text-slate-400 text-center px-1">Đang dùng mặc định</span>
                )}
              </div>
              <div className="flex-1">
                <ImageUploader label={url ? "Đổi ảnh / GIF" : "Tải ảnh / GIF"} value="" onChange={(u) => upload(s.id, u)} folder="ui-slots" />
                {url && (
                  <button type="button" disabled={busy === s.id} onClick={() => reset(s.id, s.label)} className="mt-2 text-sm font-semibold text-brand-red hover:underline">
                    Khôi phục mặc định
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

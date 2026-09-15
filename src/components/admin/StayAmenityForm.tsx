"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Initial = { label: string; icon: string; subtitle: string | null; active: boolean; sortOrder: number };

export default function StayAmenityForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [label, setLabel] = useState(initial?.label ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "fa-solid fa-circle-check");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder?.toString() ?? "0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = isEdit
      ? { icon, subtitle: subtitle || null, active, sortOrder: Number(sortOrder) }
      : { label, icon, subtitle: subtitle || null, active, sortOrder: Number(sortOrder) };

    const res = await fetch(isEdit ? `/api/stay-amenities/${encodeURIComponent(initial!.label)}` : "/api/stay-amenities", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }

    router.push("/admin/stay-amenities");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-md">
      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tên tiện ích</label>
        <input
          required
          disabled={isEdit}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:bg-slate-50 disabled:text-slate-500"
          placeholder="Wi-Fi miễn phí"
        />
        {isEdit && <p className="text-xs text-slate-400 mt-1">Không thể đổi tên sau khi tạo.</p>}
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Icon (Font Awesome)</label>
        <input
          required
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="fa-solid fa-wifi"
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mô tả ngắn (không bắt buộc)</label>
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Tốc độ cao"
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Thứ tự hiển thị</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full sm:w-40 border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
        Hiển thị trên trang Lưu trú
      </label>

      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm tiện ích"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/stay-amenities")}
          className="text-slate-500 font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}

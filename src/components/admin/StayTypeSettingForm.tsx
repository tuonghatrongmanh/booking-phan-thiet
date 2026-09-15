"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Initial = { id: string; label: string; icon: string; active: boolean; sortOrder: number };

export default function StayTypeSettingForm({ initial }: { initial: Initial }) {
  const router = useRouter();

  const [label, setLabel] = useState(initial.label);
  const [icon, setIcon] = useState(initial.icon);
  const [active, setActive] = useState(initial.active);
  const [sortOrder, setSortOrder] = useState(initial.sortOrder.toString());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/stay-types/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, icon, active, sortOrder: Number(sortOrder) }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }

    router.push("/admin/stay-types");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-md">
      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mã (enum StayType)</label>
        <input disabled value={initial.id} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] bg-slate-50 text-slate-500" />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tên hiển thị</label>
        <input
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Icon (Font Awesome)</label>
        <input
          required
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
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
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/stay-types")}
          className="text-slate-500 font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}

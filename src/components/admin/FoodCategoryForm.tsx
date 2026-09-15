"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugifyBase } from "@/lib/slug";

type Initial = {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  sortOrder: number;
};

export default function FoodCategoryForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [id, setId] = useState(initial?.id ?? "");
  const [idTouched, setIdTouched] = useState(isEdit);
  const [label, setLabel] = useState(initial?.label ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "fa-solid fa-utensils");
  const [active, setActive] = useState(initial?.active ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder?.toString() ?? "0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const displayId = idTouched ? id : slugifyBase(label);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = { id: displayId, label, icon, active, sortOrder: Number(sortOrder) };

    const res = await fetch(isEdit ? `/api/food-categories/${initial!.id}` : "/api/food-categories", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra, vui lòng kiểm tra lại các trường");
      return;
    }

    router.push("/admin/food-categories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-xl">
      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tên danh mục</label>
        <input
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Hải sản"
        />
      </div>

      {!isEdit && (
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mã danh mục (id)</label>
          <input
            value={displayId}
            onChange={(e) => {
              setIdTouched(true);
              setId(slugifyBase(e.target.value));
            }}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
          <p className="text-xs text-slate-400 mt-1">Không thể đổi sau khi tạo. Tự sinh từ tên danh mục nếu để trống.</p>
        </div>
      )}

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Icon (Font Awesome)</label>
        <input
          required
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="fa-solid fa-shrimp"
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
        Hiển thị trên trang ẩm thực
      </label>

      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm danh mục"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-slate-500 font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";

type Initial = {
  id?: string;
  name: string;
  image: string | null;
  price: number;
  unit: string;
  active: boolean;
  sortOrder: number;
};

export default function LocalSpecialtyForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "0");
  const [unit, setUnit] = useState(initial?.unit ?? "kg");
  const [active, setActive] = useState(initial?.active ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder?.toString() ?? "0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      image: image || null,
      price: Number(price),
      unit,
      active,
      sortOrder: Number(sortOrder),
    };

    const res = await fetch(isEdit ? `/api/local-specialties/${initial!.id}` : "/api/local-specialties", {
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

    router.push("/admin/local-specialties");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-xl">
      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tên sản phẩm</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Khô cá dứa"
        />
      </div>

      <ImageUploader label="Ảnh sản phẩm" value={image} onChange={setImage} folder="am-thuc" />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Giá (VNĐ)</label>
          <input
            required
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Đơn vị</label>
          <input
            required
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="kg, chai, hộp, bịch..."
          />
        </div>
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
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
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

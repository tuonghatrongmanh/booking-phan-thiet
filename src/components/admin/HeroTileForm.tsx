"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";

const ICON_OPTIONS = [
  { value: "fa-solid fa-house", label: "Nhà (Homestay)" },
  { value: "fa-solid fa-hotel", label: "Khách sạn (Villa)" },
  { value: "fa-solid fa-beer-mug-empty", label: "Ly bia (Quán nhậu)" },
  { value: "fa-solid fa-mug-saucer", label: "Cà phê" },
  { value: "fa-solid fa-umbrella-beach", label: "Bãi biển" },
  { value: "fa-solid fa-gift", label: "Quà tặng / Game" },
  { value: "fa-solid fa-utensils", label: "Ẩm thực" },
  { value: "fa-solid fa-car", label: "Xe cộ" },
  { value: "fa-solid fa-star", label: "Ngôi sao" },
  { value: "fa-solid fa-tag", label: "Khuyến mãi" },
];

const BADGE_COLORS = ["#1a6fc4", "#f5821f", "#1ea34c", "#8b5ce0", "#0f9488", "#ffc72c", "#e8483a"];

type HeroTileInitial = {
  id?: string;
  label: string;
  tagText: string;
  href: string;
  image: string;
  icon: string;
  badgeColor: string;
  special: boolean;
  sortOrder: number;
  active: boolean;
};

export default function HeroTileForm({ initial }: { initial?: HeroTileInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [label, setLabel] = useState(initial?.label ?? "");
  const [tagText, setTagText] = useState(initial?.tagText ?? "");
  const [href, setHref] = useState(initial?.href ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? ICON_OPTIONS[0].value);
  const [badgeColor, setBadgeColor] = useState(initial?.badgeColor ?? BADGE_COLORS[0]);
  const [special, setSpecial] = useState(initial?.special ?? false);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder?.toString() ?? "0");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) {
      setError("Vui lòng chọn ảnh cho ô danh mục này");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      label,
      tagText,
      href,
      image,
      icon,
      badgeColor,
      special,
      sortOrder: Number(sortOrder) || 0,
      active,
    };

    const res = await fetch(isEdit ? `/api/hero-tiles/${initial!.id}` : "/api/hero-tiles", {
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

    router.push("/admin/hero-tiles");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-2xl">
      <ImageUploader label="Ảnh ô danh mục (nên dùng ảnh vuông 1:1 để không bị cắt)" value={image} onChange={setImage} folder="hero-tiles" />

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tên hiển thị</label>
        <input
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Homestay"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Text ưu đãi</label>
          <input
            required
            value={tagText}
            onChange={(e) => setTagText(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Ưu đãi đến 50%"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Liên kết khi bấm vào</label>
          <input
            required
            value={href}
            onChange={(e) => setHref(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="/nghi-duong"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Icon huy hiệu</label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          >
            {ICON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Màu huy hiệu</label>
          <div className="flex items-center gap-2 flex-wrap">
            {BADGE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setBadgeColor(c)}
                aria-label={c}
                className={`w-8 h-8 rounded-full border-2 transition ${badgeColor === c ? "border-slate-800 scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Thứ tự hiển thị</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="0"
          />
          <p className="text-xs text-slate-400 mt-1">Số nhỏ hơn hiển thị trước.</p>
        </div>
        <div className="flex flex-col justify-center gap-2 pt-1">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
            Hiển thị ở trang chủ
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" checked={special} onChange={(e) => setSpecial(e.target.checked)} className="w-4 h-4" />
            Hiệu ứng nổi bật (dùng cho ô Game trúng thưởng)
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm ô danh mục"}
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

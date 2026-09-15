"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";

type GameInitial = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: string | null;
  coinMin: number;
  coinMax: number;
  dailyLimit: number;
  comingSoon: boolean;
  active: boolean;
  sortOrder: number;
  featuredImage: string | null;
  featuredOrder: number | null;
};

export default function GameForm({ initial }: { initial?: GameInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "fa-solid fa-gamepad");
  const [image, setImage] = useState(initial?.image ?? "");
  const [coinMin, setCoinMin] = useState(initial?.coinMin?.toString() ?? "5");
  const [coinMax, setCoinMax] = useState(initial?.coinMax?.toString() ?? "50");
  const [dailyLimit, setDailyLimit] = useState(initial?.dailyLimit?.toString() ?? "1");
  const [comingSoon, setComingSoon] = useState(initial?.comingSoon ?? false);
  const [active, setActive] = useState(initial?.active ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder?.toString() ?? "0");
  const [featuredImage, setFeaturedImage] = useState(initial?.featuredImage ?? "");
  const [featuredOrder, setFeaturedOrder] = useState(initial?.featuredOrder?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      slug,
      name,
      description,
      icon,
      image: image || null,
      coinMin: Number(coinMin),
      coinMax: Number(coinMax),
      dailyLimit: Number(dailyLimit),
      comingSoon,
      active,
      sortOrder: Number(sortOrder),
      featuredImage: featuredImage || null,
      featuredOrder: featuredOrder ? Number(featuredOrder) : null,
    };

    const res = await fetch(isEdit ? `/api/games/${initial!.id}` : "/api/games", {
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

    router.push("/admin/games");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tên game</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Vòng quay may mắn"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Slug (URL)</label>
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="vong-quay-may-man"
          />
        </div>
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mô tả ngắn</label>
        <textarea
          required
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Icon (class Font Awesome)</label>
        <input
          required
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="fa-solid fa-compass"
        />
      </div>

      <div>
        <p className="text-[13px] text-slate-400 mb-2">
          Ảnh icon hiển thị ở khối &quot;Danh sách game hấp dẫn&quot; (không bắt buộc, nếu bỏ trống sẽ dùng icon Font Awesome ở trên).
        </p>
        <ImageUploader label="Ảnh icon danh sách game" value={image} onChange={setImage} folder="games" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Xu tối thiểu</label>
          <input
            required
            type="number"
            min={0}
            value={coinMin}
            onChange={(e) => setCoinMin(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Xu tối đa</label>
          <input
            required
            type="number"
            min={0}
            value={coinMax}
            onChange={(e) => setCoinMax(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Lượt chơi miễn phí/ngày</label>
          <input
            required
            type="number"
            min={1}
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
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

      <div className="border-t border-slate-100 pt-5">
        <p className="text-sm font-bold text-slate-700 mb-1">Khối &quot;Game nổi bật&quot;</p>
        <p className="text-[13px] text-slate-400 mb-3">
          Hiển thị game này ở khối poster 4 ô trên trang Game trúng thưởng (không bắt buộc).
        </p>
        <div className="grid sm:grid-cols-[1fr_180px] gap-4">
          <ImageUploader label="Ảnh poster nổi bật" value={featuredImage} onChange={setFeaturedImage} folder="games" />
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Vị trí (1-4)</label>
            <select
              value={featuredOrder}
              onChange={(e) => setFeaturedOrder(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            >
              <option value="">Không hiển thị</option>
              <option value="1">Vị trí 1</option>
              <option value="2">Vị trí 2</option>
              <option value="3">Vị trí 3</option>
              <option value="4">Vị trí 4</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
          Hiển thị trên trang game
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <input type="checkbox" checked={comingSoon} onChange={(e) => setComingSoon(e.target.checked)} className="w-4 h-4" />
          Sắp ra mắt (chưa cho chơi)
        </label>
      </div>

      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm game"}
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

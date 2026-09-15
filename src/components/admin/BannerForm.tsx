"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";

type BannerInitial = {
  id?: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonHref: string | null;
  image: string;
  sortOrder: number;
  active: boolean;
};

export default function BannerForm({ initial }: { initial?: BannerInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [buttonText, setButtonText] = useState(initial?.buttonText ?? "Chia sẻ ngay");
  const [buttonHref, setButtonHref] = useState(initial?.buttonHref ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder?.toString() ?? "0");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) {
      setError("Vui lòng chọn ảnh nền cho banner");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title,
      subtitle: subtitle || undefined,
      buttonText: buttonText || undefined,
      buttonHref: buttonHref || undefined,
      image,
      sortOrder: Number(sortOrder) || 0,
      active,
    };

    const res = await fetch(isEdit ? `/api/banners/${initial!.id}` : "/api/banners", {
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

    router.push("/admin/banners");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-2xl">
      <ImageUploader label="Ảnh nền banner" value={image} onChange={setImage} folder="banners" />

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tiêu đề</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Bạn đã từng bị lừa đảo?"
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mô tả phụ</label>
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Chia sẻ để bảo vệ cộng đồng du lịch Phan Thiết"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Text nút bấm</label>
          <input
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Chia sẻ ngay"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Liên kết khi bấm nút</label>
          <input
            value={buttonHref}
            onChange={(e) => setButtonHref(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="/nghi-duong"
          />
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
          />
          <p className="text-xs text-slate-400 mt-1">Banner có số nhỏ nhất & đang bật sẽ hiện ở trang chủ.</p>
        </div>
        <div className="flex flex-col justify-center pt-1">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
            Hiển thị ở trang chủ
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
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm banner"}
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

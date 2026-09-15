"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";

type PopupInitial = {
  id?: string;
  title: string | null;
  image: string;
  href: string | null;
  sortOrder: number;
  active: boolean;
};

export default function PopupForm({ initial }: { initial?: PopupInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [href, setHref] = useState(initial?.href ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder?.toString() ?? "0");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) {
      setError("Vui lòng chọn ảnh pop-up");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: title || undefined,
      image,
      href: href || undefined,
      sortOrder: Number(sortOrder) || 0,
      active,
    };

    const res = await fetch(isEdit ? `/api/popups/${initial!.id}` : "/api/popups", {
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

    router.push("/admin/popups");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-2xl">
      <ImageUploader label="Ảnh pop-up (hiện giữa màn hình, nên dùng ảnh dọc hoặc vuông)" value={image} onChange={setImage} folder="popups" />

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tiêu đề (chỉ để quản lý nội bộ, không hiện ngoài web)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Khuyến mãi tháng 9"
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Liên kết khi bấm vào ảnh (không bắt buộc)</label>
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="/luu-tru"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Thứ tự ưu tiên</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
          <p className="text-xs text-slate-400 mt-1">Nếu có nhiều pop-up đang bật, pop-up số nhỏ nhất sẽ hiện.</p>
        </div>
        <div className="flex flex-col justify-center pt-1">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
            Bật pop-up này
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
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm pop-up"}
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

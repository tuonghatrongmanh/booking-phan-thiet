"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";

type Initial = {
  id?: string;
  name: string;
  avatar: string | null;
  action: string;
  icon: string;
  sortOrder: number;
  active: boolean;
};

const ICON_PRESETS = [
  { value: "fa-solid fa-star", label: "⭐ Đánh giá" },
  { value: "fa-solid fa-coins", label: "🪙 Trúng xu" },
  { value: "fa-solid fa-gift", label: "🎁 Đổi quà" },
  { value: "fa-solid fa-motorcycle", label: "🏍️ Thuê xe" },
  { value: "fa-solid fa-house", label: "🏠 Đặt phòng" },
  { value: "fa-solid fa-utensils", label: "🍜 Ẩm thực" },
  { value: "fa-solid fa-newspaper", label: "📰 Tin tức" },
  { value: "fa-solid fa-bell", label: "🔔 Khác" },
];

export default function ActivitySampleForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? "");
  const [avatar, setAvatar] = useState(initial?.avatar ?? "");
  const [action, setAction] = useState(initial?.action ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "fa-solid fa-bell");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder?.toString() ?? "0");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !action.trim()) {
      setError("Vui lòng nhập đủ tên và nội dung hành động");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim(),
      avatar: avatar || "",
      action: action.trim(),
      icon: icon || "fa-solid fa-bell",
      sortOrder: Number(sortOrder) || 0,
      active,
    };

    const res = await fetch(isEdit ? `/api/activity-samples/${initial!.id}` : "/api/activity-samples", {
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

    router.push("/admin/activity-samples");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-2xl">
      <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
        <p className="text-sm font-semibold text-slate-700 mb-1">Xem trước</p>
        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-md border border-sky-100 px-4 py-3 max-w-sm">
          <span className="relative shrink-0 w-10 h-10 rounded-full overflow-hidden ring-2 ring-brand-sky bg-slate-100">
            {avatar && <img src={avatar} alt="" className="w-full h-full object-cover" />}
          </span>
          <p className="text-[13px] text-slate-700 leading-snug flex-1 min-w-0">
            <strong className="font-bold text-slate-800">{name || "Tên khách"}</strong> {action || "vừa làm gì đó..."}
          </p>
        </div>
      </div>

      <ImageUploader label="Ảnh đại diện (không bắt buộc, để trống sẽ dùng ảnh ngẫu nhiên)" value={avatar} onChange={setAvatar} folder="activity-samples" />

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tên khách hàng (ví dụ)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Mạnh Tường"
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Nội dung hành động (hiện ngay sau tên)</label>
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="vừa book xe Honda Vision tại Mũi Né"
        />
        <p className="text-xs text-slate-400 mt-1">Thời gian (ngày/giờ) sẽ tự thêm vào cuối, luôn hiện là mới xảy ra.</p>
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Biểu tượng</label>
        <select
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        >
          {ICON_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
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
        </div>
        <div className="flex flex-col justify-center pt-1">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
            Bật hiển thị mục này
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
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm mục"}
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

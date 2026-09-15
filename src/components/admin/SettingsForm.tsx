"use client";
import CharCounter from "@/components/admin/CharCounter";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { SiteSettingsData } from "@/lib/settings";

export default function SettingsForm({ initial }: { initial: SiteSettingsData }) {
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState(initial.faviconUrl);
  const [footerDescription, setFooterDescription] = useState(initial.footerDescription);
  const [homeSeoTitle, setHomeSeoTitle] = useState(initial.homeSeoTitle);
  const [homeSeoDescription, setHomeSeoDescription] = useState(initial.homeSeoDescription);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl, faviconUrl, footerDescription, homeSeoTitle, homeSeoDescription }),
    });

    setSaving(false);

    if (!res.ok) {
      setMessage({ type: "error", text: "Có lỗi xảy ra, vui lòng thử lại." });
      return;
    }
    setMessage({ type: "success", text: "Đã lưu cài đặt." });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
        <h2 className="font-display font-bold text-lg text-slate-800">Thương hiệu</h2>

        <ImageUploader label="Logo website" value={logoUrl} onChange={setLogoUrl} folder="settings" />
        <p className="text-xs text-slate-400 -mt-3">
          Hiển thị ở header và footer. Nên dùng ảnh vuông hoặc gần vuông, nền trong suốt (PNG), tối thiểu 200×200px.
        </p>

        <ImageUploader label="Favicon (icon tab trình duyệt)" value={faviconUrl} onChange={setFaviconUrl} folder="settings" />
        <p className="text-xs text-slate-400 -mt-3">Ảnh vuông, khuyến nghị 512×512px (PNG hoặc ICO), sẽ được thu nhỏ tự động khi hiển thị trên tab trình duyệt.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 space-y-2">
        <h2 className="font-display font-bold text-lg text-slate-800 mb-3">Footer</h2>
        <div className="flex items-center justify-between">
          <label className="text-[13px] text-slate-500 font-medium">Mô tả ngắn dưới logo</label>
          <CharCounter value={footerDescription} max={200} />
        </div>
        <textarea
          rows={3}
          value={footerDescription}
          onChange={(e) => setFooterDescription(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Hệ thống tra cứu và đánh giá uy tín hàng đầu tại Phan Thiết..."
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="font-display font-bold text-lg text-slate-800">SEO trang chủ</h2>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[13px] text-slate-500 font-medium">Tiêu đề SEO (thẻ title)</label>
            <CharCounter value={homeSeoTitle} max={70} />
          </div>
          <input
            value={homeSeoTitle}
            onChange={(e) => setHomeSeoTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Booking Phan Thiết - Tra cứu thông tin uy tín"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[13px] text-slate-500 font-medium">Mô tả SEO (meta description)</label>
            <CharCounter value={homeSeoDescription} max={160} />
          </div>
          <textarea
            rows={3}
            value={homeSeoDescription}
            onChange={(e) => setHomeSeoDescription(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Tra cứu, đánh giá homestay, quán ăn, dịch vụ thuê xe uy tín tại Phan Thiết..."
          />
        </div>

        <div>
          <p className="text-[13px] text-slate-500 font-medium mb-1.5">Xem trước trên Google</p>
          <div className="border border-slate-200 rounded-xl px-4 py-3 bg-slate-50">
            <p className="text-[13px] text-brand-green leading-tight truncate">bookingphanthiet.com</p>
            <p className="text-[#1a0dab] text-lg leading-snug truncate">{homeSeoTitle || "Tiêu đề trang chủ"}</p>
            <p className="text-sm text-slate-600 leading-snug line-clamp-2">
              {homeSeoDescription || "Mô tả trang chủ sẽ hiện ở đây trên kết quả tìm kiếm Google."}
            </p>
          </div>
        </div>
      </div>

      {message && (
        <p className={`text-sm rounded-lg px-3 py-2 ${message.type === "success" ? "text-brand-green bg-brand-greenBg" : "text-brand-red bg-brand-redBg"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}

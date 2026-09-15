"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { LuuTruPageSettingsData } from "@/lib/luu-tru-settings";

export default function LuuTruPageSettingsForm({ initial }: { initial: LuuTruPageSettingsData }) {
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initial.mapEmbedUrl ?? "");
  const [promoTitle, setPromoTitle] = useState(initial.promoTitle ?? "");
  const [promoSubtitle, setPromoSubtitle] = useState(initial.promoSubtitle ?? "");
  const [promoButtonText, setPromoButtonText] = useState(initial.promoButtonText ?? "");
  const [verifiedStampImage, setVerifiedStampImage] = useState(initial.verifiedStampImage ?? "");
  const [crossPromoImage, setCrossPromoImage] = useState(initial.crossPromoImage ?? "");
  const [crossPromoTitle, setCrossPromoTitle] = useState(initial.crossPromoTitle ?? "");
  const [crossPromoButtonText, setCrossPromoButtonText] = useState(initial.crossPromoButtonText ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/luu-tru-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mapEmbedUrl,
        promoTitle,
        promoSubtitle,
        promoButtonText,
        verifiedStampImage,
        crossPromoImage,
        crossPromoTitle,
        crossPromoButtonText,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      setMessage({ type: "error", text: "Có lỗi xảy ra, vui lòng thử lại." });
      return;
    }
    setMessage({ type: "success", text: "Đã lưu cài đặt." });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5">
      <div>
        <h2 className="font-display font-bold text-lg text-slate-800 mb-1">Bản đồ tổng thể Phan Thiết</h2>
        <p className="text-sm text-slate-400 mb-3">
          Link nhúng Google Maps hiển thị ở khối &quot;Khám phá theo khu vực&quot; trên trang /luu-tru. Để trống sẽ hiện hình minh họa mặc định.
        </p>
        <input
          value={mapEmbedUrl}
          onChange={(e) => setMapEmbedUrl(e.target.value)}
          placeholder="https://www.google.com/maps/embed?pb=..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
      </div>

      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h2 className="font-display font-bold text-lg text-slate-800">Banner khuyến mãi (cuối sidebar)</h2>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tiêu đề</label>
          <input
            value={promoTitle}
            onChange={(e) => setPromoTitle(e.target.value)}
            placeholder="Giảm đến 30%"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mô tả</label>
          <input
            value={promoSubtitle}
            onChange={(e) => setPromoSubtitle(e.target.value)}
            placeholder="cho đặt phòng sớm"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Text nút</label>
          <input
            value={promoButtonText}
            onChange={(e) => setPromoButtonText(e.target.value)}
            placeholder="Xem ưu đãi ngay"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h2 className="font-display font-bold text-lg text-slate-800">Con dấu &quot;Đã kiểm chứng&quot;</h2>
        <p className="text-sm text-slate-400">
          Dùng chung cho mọi địa điểm tham quan có bật &quot;Đã kiểm chứng&quot;, hiển thị ở trang chi tiết /diem-tham-quan/[id].
        </p>
        <ImageUploader label="Ảnh con dấu" value={verifiedStampImage} onChange={setVerifiedStampImage} folder="luu-tru" />
      </div>

      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h2 className="font-display font-bold text-lg text-slate-800">Banner cuối trang chi tiết điểm tham quan</h2>
        <ImageUploader label="Ảnh nền banner" value={crossPromoImage} onChange={setCrossPromoImage} folder="luu-tru" />
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tiêu đề</label>
          <input
            value={crossPromoTitle}
            onChange={(e) => setCrossPromoTitle(e.target.value)}
            placeholder="Khám phá thêm địa điểm tham quan tại Phan Thiết"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Text nút</label>
          <input
            value={crossPromoButtonText}
            onChange={(e) => setCrossPromoButtonText(e.target.value)}
            placeholder="Xem thêm"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
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

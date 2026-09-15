"use client";

import { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

// Panel quan ly banner hero cho 1 trang danh muc cu the (vd trang Luu tru), dua tren
// model PageBanner (slot-based). Chi can 1 form "luu la thay" - POST /api/page-banners
// tu dong tat banner active cu cung slot va tao row moi, khong can UI danh sach rieng.
export default function StayBannerPanel({ slot, defaultImage }: { slot: string; defaultImage: string }) {
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/page-banners?slot=${encodeURIComponent(slot)}`)
      .then((r) => r.json())
      .then((data) => setImage(data?.image ?? ""))
      .finally(() => setLoading(false));
  }, [slot]);

  async function handleSave() {
    if (!image) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/page-banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot, image }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return null;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="font-display font-bold text-lg text-slate-800 mb-1">Banner đầu trang Lưu trú</h2>
      <p className="text-sm text-slate-400 mb-4">
        Ảnh nền hiển thị ở đầu trang /luu-tru. Chưa đặt ảnh riêng thì trang sẽ dùng ảnh mặc định.
      </p>
      <ImageUploader label="Ảnh banner" value={image || defaultImage} onChange={setImage} folder="page-banners" />
      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !image}
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : "Lưu banner"}
        </button>
        {saved && <span className="text-sm font-semibold text-brand-green">Đã lưu!</span>}
      </div>
    </div>
  );
}

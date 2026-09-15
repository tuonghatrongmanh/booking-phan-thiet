"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { AmThucBannerSettingsData } from "@/lib/am-thuc-banner-settings";

export default function AmThucBannerForm({ initial }: { initial: AmThucBannerSettingsData }) {
  const [heroBanner, setHeroBanner] = useState(initial.heroBanner ?? "");
  const [badgeIcon, setBadgeIcon] = useState(initial.badgeIcon ?? "");
  const [badgeText, setBadgeText] = useState(initial.badgeText ?? "");
  const [headingTop, setHeadingTop] = useState(initial.headingTop ?? "");
  const [headingBottom, setHeadingBottom] = useState(initial.headingBottom ?? "");
  const [subheading, setSubheading] = useState(initial.subheading ?? "");

  const [promoImage, setPromoImage] = useState(initial.promoImage ?? "");
  const [promoTitle, setPromoTitle] = useState(initial.promoTitle ?? "");
  const [promoPrice, setPromoPrice] = useState(initial.promoPrice ?? "");
  const [promoFeature1, setPromoFeature1] = useState(initial.promoFeature1 ?? "");
  const [promoFeature2, setPromoFeature2] = useState(initial.promoFeature2 ?? "");
  const [promoFeature3, setPromoFeature3] = useState(initial.promoFeature3 ?? "");
  const [promoButtonText, setPromoButtonText] = useState(initial.promoButtonText ?? "");

  const [trustIcon1, setTrustIcon1] = useState(initial.trustIcon1 ?? "");
  const [trustTitle1, setTrustTitle1] = useState(initial.trustTitle1 ?? "");
  const [trustDesc1, setTrustDesc1] = useState(initial.trustDesc1 ?? "");
  const [trustIcon2, setTrustIcon2] = useState(initial.trustIcon2 ?? "");
  const [trustTitle2, setTrustTitle2] = useState(initial.trustTitle2 ?? "");
  const [trustDesc2, setTrustDesc2] = useState(initial.trustDesc2 ?? "");
  const [trustIcon3, setTrustIcon3] = useState(initial.trustIcon3 ?? "");
  const [trustTitle3, setTrustTitle3] = useState(initial.trustTitle3 ?? "");
  const [trustDesc3, setTrustDesc3] = useState(initial.trustDesc3 ?? "");

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

    const res = await fetch("/api/admin/am-thuc-banner-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        heroBanner, badgeIcon, badgeText, headingTop, headingBottom, subheading,
        promoImage, promoTitle, promoPrice, promoFeature1, promoFeature2, promoFeature3, promoButtonText,
        trustIcon1, trustTitle1, trustDesc1, trustIcon2, trustTitle2, trustDesc2, trustIcon3, trustTitle3, trustDesc3,
        verifiedStampImage, crossPromoImage, crossPromoTitle, crossPromoButtonText,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      setMessage({ type: "error", text: "Có lỗi xảy ra, vui lòng thử lại." });
      return;
    }
    setMessage({ type: "success", text: "Đã lưu banner." });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-card p-6 space-y-3">
        <h2 className="font-display font-bold text-lg text-slate-800">Ảnh banner</h2>
        <p className="text-[13px] text-slate-400">Ảnh nền phần đầu trang <code>/am-thuc</code>.</p>
        <ImageUploader label="Ảnh banner" value={heroBanner} onChange={setHeroBanner} folder="am-thuc" />
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="font-display font-bold text-lg text-slate-800">Badge nhỏ (icon + text)</h2>
        <div className="grid sm:grid-cols-[140px_1fr] gap-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Icon (Font Awesome)</label>
            <input
              value={badgeIcon}
              onChange={(e) => setBadgeIcon(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="fa-solid fa-utensils"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Text</label>
            <input
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="ẨM THỰC PHAN THIẾT"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="font-display font-bold text-lg text-slate-800">Tiêu đề</h2>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Dòng trên (chữ nghiêng, nhạt)</label>
          <input
            value={headingTop}
            onChange={(e) => setHeadingTop(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Hương vị biển cả,"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Dòng dưới (chữ đậm, màu nhấn)</label>
          <input
            value={headingBottom}
            onChange={(e) => setHeadingBottom(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Đậm đà Phan Thiết"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Đoạn mô tả dưới tiêu đề</label>
          <textarea
            rows={2}
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="font-display font-bold text-lg text-slate-800">Thẻ &quot;Combo khuyến mãi&quot; (cột phải)</h2>
        <p className="text-[13px] text-slate-400">Thẻ ảnh + text hiển thị đầu tiên trong cột bên phải trang Ẩm thực.</p>
        <ImageUploader label="Ảnh nền thẻ" value={promoImage} onChange={setPromoImage} folder="am-thuc" />
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tiêu đề</label>
          <input
            value={promoTitle}
            onChange={(e) => setPromoTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Combo hải sản siêu hấp dẫn!"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Text giá (badge %)</label>
          <input
            value={promoPrice}
            onChange={(e) => setPromoPrice(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Chỉ từ 299.000đ/người"
          />
        </div>
        <div className="grid gap-3">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mục 1</label>
            <input
              value={promoFeature1}
              onChange={(e) => setPromoFeature1(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mục 2</label>
            <input
              value={promoFeature2}
              onChange={(e) => setPromoFeature2(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mục 3</label>
            <input
              value={promoFeature3}
              onChange={(e) => setPromoFeature3(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            />
          </div>
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Text nút</label>
          <input
            value={promoButtonText}
            onChange={(e) => setPromoButtonText(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Đặt bàn ngay"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
        <h2 className="font-display font-bold text-lg text-slate-800">3 mục tin cậy (cột phải)</h2>
        {[
          { icon: trustIcon1, setIcon: setTrustIcon1, title: trustTitle1, setTitle: setTrustTitle1, desc: trustDesc1, setDesc: setTrustDesc1 },
          { icon: trustIcon2, setIcon: setTrustIcon2, title: trustTitle2, setTitle: setTrustTitle2, desc: trustDesc2, setDesc: setTrustDesc2 },
          { icon: trustIcon3, setIcon: setTrustIcon3, title: trustTitle3, setTitle: setTrustTitle3, desc: trustDesc3, setDesc: setTrustDesc3 },
        ].map((item, i) => (
          <div key={i} className="grid sm:grid-cols-[120px_1fr_1fr] gap-3 pt-4 border-t border-slate-100 first:pt-0 first:border-0">
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Icon {i + 1}</label>
              <input
                value={item.icon}
                onChange={(e) => item.setIcon(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tiêu đề {i + 1}</label>
              <input
                value={item.title}
                onChange={(e) => item.setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mô tả {i + 1}</label>
              <input
                value={item.desc}
                onChange={(e) => item.setDesc(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 space-y-3">
        <h2 className="font-display font-bold text-lg text-slate-800">Con dấu &quot;Đã kiểm chứng&quot;</h2>
        <p className="text-[13px] text-slate-400">
          Ảnh con dấu hiển thị ở khối &quot;Đã kiểm chứng &amp; xác thực&quot; trên trang chi tiết của MỌI món ăn đã tick &quot;Đã kiểm duyệt bởi Admin&quot;.
        </p>
        <ImageUploader label="Ảnh con dấu" value={verifiedStampImage} onChange={setVerifiedStampImage} folder="am-thuc" />
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 space-y-3">
        <h2 className="font-display font-bold text-lg text-slate-800">Banner cuối trang chi tiết món ăn</h2>
        <p className="text-[13px] text-slate-400">Khối &quot;Khám phá thêm...&quot; ở cuối cột phải trang chi tiết món ăn.</p>
        <ImageUploader label="Ảnh nền" value={crossPromoImage} onChange={setCrossPromoImage} folder="am-thuc" />
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tiêu đề</label>
          <input
            value={crossPromoTitle}
            onChange={(e) => setCrossPromoTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Khám phá thêm Nhà hàng &amp; Quán ăn ngon tại Phan Thiết"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Text nút</label>
          <input
            value={crossPromoButtonText}
            onChange={(e) => setCrossPromoButtonText(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Xem thêm"
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

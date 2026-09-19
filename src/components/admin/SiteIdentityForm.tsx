"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { IdentityField, SiteSettingsData } from "@/lib/settings";

type FieldDef = {
  key: IdentityField;
  label: string;
  placeholder?: string;
  help?: string;
  multiline?: boolean;
};

type Section = { id: string; title: string; intro: string; fields: FieldDef[] };

const SECTIONS: Section[] = [
  {
    id: "google",
    title: "Google Search Console & công cụ theo dõi",
    intro:
      "Dán mã xác minh để quản lý traffic và thứ hạng của website trên Google. Bạn có thể dán nguyên cả thẻ <meta ...> Google đưa, hệ thống tự lấy phần mã.",
    fields: [
      {
        key: "googleSiteVerification",
        label: "Mã xác minh Google Search Console",
        placeholder: "VD: AbC123... (hoặc dán cả thẻ meta)",
        help: "Vào search.google.com/search-console → Thêm tài sản → chọn 'Tiền tố URL' → phương thức 'Thẻ HTML' → sao chép thẻ meta dán vào đây → Lưu → quay lại Search Console bấm 'Xác minh'.",
      },
      {
        key: "bingSiteVerification",
        label: "Mã xác minh Bing Webmaster (không bắt buộc)",
        placeholder: "Mã từ Bing Webmaster Tools",
      },
      {
        key: "googleAnalyticsId",
        label: "Google Analytics 4 - Measurement ID (không bắt buộc)",
        placeholder: "G-XXXXXXXXXX",
        help: "Để xem số khách truy cập, nguồn truy cập, trang được xem nhiều. Chỉ đếm khách ở trang công khai, không đếm trang admin.",
      },
    ],
  },
  {
    id: "org",
    title: "Thông tin tổ chức (hiển thị cho Google)",
    intro: "Những thông tin này xuất hiện ở trang 'Về chúng tôi' và dữ liệu có cấu trúc để Google hiểu website là của ai.",
    fields: [
      { key: "orgName", label: "Tên thương hiệu / tổ chức", placeholder: "Booking Phan Thiết" },
      { key: "orgPhone", label: "Số điện thoại liên hệ", placeholder: "0912345678" },
      { key: "orgEmail", label: "Email liên hệ", placeholder: "lienhe@bookingphanthiet.com" },
      { key: "orgAddress", label: "Địa chỉ", placeholder: "Số nhà, đường, phường/xã, Phan Thiết, Bình Thuận" },
    ],
  },
  {
    id: "founder",
    title: "Người sáng lập (Founder)",
    intro:
      "Thông tin và ảnh của bạn. Google dùng những thông tin này (cùng các liên kết mạng xã hội bên dưới) để nhận ra bạn là người đứng sau website.",
    fields: [
      { key: "founderName", label: "Họ và tên", placeholder: "Nguyễn Văn A" },
      { key: "founderTitle", label: "Chức danh", placeholder: "Nhà sáng lập Booking Phan Thiết" },
      { key: "founderBio", label: "Giới thiệu ngắn", multiline: true, placeholder: "Vài câu về bạn, kinh nghiệm và lý do lập ra website..." },
    ],
  },
  {
    id: "social",
    title: "Mạng xã hội & trang xác thực",
    intro:
      "Các trang cá nhân/thương hiệu THẬT của bạn. Càng nhiều nơi cùng nhắc đúng tên bạn và trỏ về website, Google càng tin đây là một thực thể uy tín.",
    fields: [
      { key: "facebookUrl", label: "Facebook", placeholder: "https://facebook.com/..." },
      { key: "tiktokUrl", label: "TikTok", placeholder: "https://tiktok.com/@..." },
      { key: "youtubeUrl", label: "YouTube", placeholder: "https://youtube.com/@..." },
      { key: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/..." },
      { key: "linkedinUrl", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
      { key: "zaloUrl", label: "Zalo / Zalo OA", placeholder: "https://zalo.me/..." },
      { key: "googleBusinessUrl", label: "Google Business Profile (nếu có)", placeholder: "https://g.page/... hoặc link Google Maps" },
      { key: "sameAsExtra", label: "Trang khác nhắc đến bạn (mỗi dòng 1 liên kết)", multiline: true, placeholder: "Bài báo, Wikipedia/Wikidata, trang giới thiệu doanh nghiệp..." },
    ],
  },
];

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40";

export default function SiteIdentityForm({ initial }: { initial: SiteSettingsData }) {
  const [values, setValues] = useState<Record<IdentityField, string>>(() => {
    const v = {} as Record<IdentityField, string>;
    for (const sec of SECTIONS) for (const f of sec.fields) v[f.key] = initial[f.key] ?? "";
    v.founderPhoto = initial.founderPhoto ?? "";
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function set(key: IdentityField, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      const flat = data?.error?.fieldErrors as Record<string, string[]> | undefined;
      const first = flat ? Object.entries(flat).find(([, v]) => v?.length) : undefined;
      setMessage({ type: "error", text: first ? `${first[0]}: ${first[1][0]}` : "Có lỗi xảy ra, vui lòng thử lại." });
      return;
    }
    setMessage({ type: "success", text: "Đã lưu. Website sẽ cập nhật ngay." });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {SECTIONS.map((sec) => (
        <div key={sec.id} className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-800">{sec.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{sec.intro}</p>
          </div>

          {sec.id === "founder" && (
            <div>
              <ImageUploader label="Ảnh của bạn (ảnh chân dung rõ mặt)" value={values.founderPhoto} onChange={(v) => set("founderPhoto", v)} folder="settings" />
              <p className="text-xs text-slate-400 mt-1">Ảnh vuông hoặc chân dung, tối thiểu 400×400px, đúng người thật (Google sẽ đối chiếu với các trang mạng xã hội).</p>
            </div>
          )}

          {sec.fields.map((f) => (
            <div key={f.key}>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">{f.label}</label>
              {f.multiline ? (
                <textarea rows={f.key === "founderBio" ? 5 : 4} value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} className={inputCls} placeholder={f.placeholder} />
              ) : (
                <input value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} className={inputCls} placeholder={f.placeholder} />
              )}
              {f.help && <p className="text-xs text-slate-400 mt-1">{f.help}</p>}
            </div>
          ))}
        </div>
      ))}

      {message && (
        <p className={`text-sm rounded-lg px-3 py-2 ${message.type === "success" ? "text-brand-green bg-brand-greenBg" : "text-brand-red bg-brand-redBg"}`}>
          {message.text}
        </p>
      )}
      <button type="submit" disabled={saving} className="bg-brand-blue text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60">
        {saving ? "Đang lưu..." : "Lưu thông tin"}
      </button>
    </form>
  );
}

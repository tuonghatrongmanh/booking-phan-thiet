"use client";

import { useMemo } from "react";
import CharCounter from "@/components/admin/CharCounter";
import { analyzeSeo, LISTING_SEO_OPTIONS, type SeoCheckStatus } from "@/lib/seo-analyzer";

const STATUS_ICON: Record<SeoCheckStatus, string> = {
  good: "fa-solid fa-circle-check text-brand-green",
  warning: "fa-solid fa-triangle-exclamation text-amber-500",
  bad: "fa-solid fa-circle-xmark text-brand-red",
};

export type SeoValue = { metaTitle: string; metaDescription: string; focusKeyword: string };

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40";

// Khối "SEO" dùng chung cho địa điểm / món ăn / trang danh sách: nhập tiêu đề + mô tả + từ khóa
// chính, xem trước kết quả Google và chấm điểm SEO trực tiếp (cùng bộ chấm điểm của bài Tin tức).
export default function SeoEditor({
  title,
  slug,
  url,
  contentHtml,
  value,
  onChange,
  fallbackDescription = "",
}: {
  title: string;
  slug: string;
  url: string; // đường dẫn hiển thị trong bản xem trước, vd "bookingphanthiet.com/luu-tru/abc"
  contentHtml: string;
  value: SeoValue;
  onChange: (v: SeoValue) => void;
  fallbackDescription?: string;
}) {
  const analysis = useMemo(
    () =>
      analyzeSeo(
        {
          title,
          slug,
          metaTitle: value.metaTitle,
          metaDescription: value.metaDescription || fallbackDescription,
          focusKeyword: value.focusKeyword,
          contentHtml,
        },
        LISTING_SEO_OPTIONS
      ),
    [title, slug, value.metaTitle, value.metaDescription, value.focusKeyword, contentHtml, fallbackDescription]
  );

  const shownTitle = (value.metaTitle || title || "Tiêu đề trang").slice(0, 70);
  const shownDescription = (value.metaDescription || fallbackDescription || "Chưa có mô tả SEO - Google sẽ tự chọn một đoạn trong trang.").slice(0, 160);

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-800">SEO trên Google</h2>
          <p className="text-sm text-slate-400">Điểm càng cao, trang càng dễ được Google đánh giá tốt và xếp hạng cao.</p>
        </div>
        <span className={`text-sm font-extrabold whitespace-nowrap ${analysis.scoreColor}`}>
          {analysis.score}/100 · {analysis.scoreLabel}
        </span>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-[12px] text-slate-400 mb-1">Xem trước trên Google</p>
        <p className="text-[13px] text-slate-500 truncate">{url}</p>
        <p className="text-[18px] leading-snug text-[#1a0dab] font-medium truncate">{shownTitle}</p>
        <p className="text-[13px] text-slate-600 line-clamp-2">{shownDescription}</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[13px] text-slate-500 font-medium">Tiêu đề SEO (thẻ title)</label>
          <CharCounter value={value.metaTitle} max={70} />
        </div>
        <input
          value={value.metaTitle}
          maxLength={70}
          onChange={(e) => onChange({ ...value, metaTitle: e.target.value })}
          className={inputCls}
          placeholder="Để trống = dùng tên. Nên 50-60 ký tự, có từ khóa chính ở đầu."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[13px] text-slate-500 font-medium">Mô tả SEO (meta description)</label>
          <CharCounter value={value.metaDescription} max={160} />
        </div>
        <textarea
          rows={3}
          value={value.metaDescription}
          maxLength={160}
          onChange={(e) => onChange({ ...value, metaDescription: e.target.value })}
          className={inputCls}
          placeholder="Tóm tắt hấp dẫn 120-150 ký tự, có từ khóa chính và lời kêu gọi hành động."
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Từ khóa chính (focus keyword)</label>
        <input
          value={value.focusKeyword}
          maxLength={80}
          onChange={(e) => onChange({ ...value, focusKeyword: e.target.value })}
          className={inputCls}
          placeholder="VD: homestay view biển Phan Thiết"
        />
        <p className="text-xs text-slate-400 mt-1">Cụm từ khách hay gõ trên Google để tìm đúng nơi này.</p>
      </div>

      <ul className="space-y-3 border-t border-slate-100 pt-4">
        {analysis.checks.map((check) => (
          <li key={check.id} className="flex items-start gap-2.5">
            <i className={`${STATUS_ICON[check.status]} text-sm mt-0.5 shrink-0`} aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-700">{check.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{check.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

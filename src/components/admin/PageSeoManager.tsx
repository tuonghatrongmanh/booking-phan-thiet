"use client";

import { useState } from "react";
import SeoEditor, { type SeoValue } from "@/components/admin/SeoEditor";

type PageItem = {
  key: string;
  label: string;
  defaultTitle: string;
  defaultDescription: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
};

function PageSeoCard({ page }: { page: PageItem }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<SeoValue>({
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    focusKeyword: page.focusKeyword,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/page-seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: page.key, ...value }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    setMessage(
      res.ok
        ? { type: "success", text: "Đã lưu. Google sẽ cập nhật khi thu thập lại trang." }
        : { type: "error", text: typeof data.error === "string" ? data.error : "Có lỗi xảy ra, vui lòng thử lại." }
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 text-left px-6 py-4"
        aria-expanded={open}
      >
        <span>
          <span className="block font-bold text-slate-800">{page.label}</span>
          <span className="block text-xs text-slate-400 font-mono">{page.key}</span>
        </span>
        <i className={`fa-solid fa-chevron-down text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-4">
          <SeoEditor
            title={page.label}
            slug={page.key.replace("/", "")}
            url={`bookingphanthiet.com${page.key}`}
            contentHtml=""
            value={value}
            onChange={setValue}
            fallbackDescription={page.defaultDescription}
          />
          <p className="text-xs text-slate-400">Để trống tiêu đề/mô tả = dùng mặc định: &quot;{page.defaultTitle}&quot;.</p>
          {message && (
            <p className={`text-sm rounded-lg px-3 py-2 ${message.type === "success" ? "text-brand-green bg-brand-greenBg" : "text-brand-red bg-brand-redBg"}`}>
              {message.text}
            </p>
          )}
          <button type="button" onClick={save} disabled={saving} className="bg-brand-blue text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60">
            {saving ? "Đang lưu..." : "Lưu SEO trang này"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function PageSeoManager({ pages }: { pages: PageItem[] }) {
  return (
    <div className="space-y-4 max-w-3xl">
      {pages.map((p) => (
        <PageSeoCard key={p.key} page={p} />
      ))}
    </div>
  );
}

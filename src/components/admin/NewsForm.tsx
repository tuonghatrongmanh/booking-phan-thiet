"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import CharCounter from "@/components/admin/CharCounter";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { slugifyBase } from "@/lib/slug";
import { analyzeSeo, type SeoCheckStatus } from "@/lib/seo-analyzer";

const CATEGORIES = ["Kinh nghiệm", "Địa điểm", "Ẩm thực", "Trải nghiệm"];

const STATUS_ICON: Record<SeoCheckStatus, string> = {
  good: "fa-solid fa-circle-check text-brand-green",
  warning: "fa-solid fa-triangle-exclamation text-amber-500",
  bad: "fa-solid fa-circle-xmark text-brand-red",
};

type NewsInitial = {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  published: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  placeId?: string | null;
};

type PlaceOption = { id: string; name: string; category: string };

export default function NewsForm({ initial, places = [] }: { initial?: NewsInitial; places?: PlaceOption[] }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [placeId, setPlaceId] = useState(initial?.placeId ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [focusKeyword, setFocusKeyword] = useState(initial?.focusKeyword ?? "");
  const [keywordSuggestion, setKeywordSuggestion] = useState<{ focusKeyword: string; related: string[] } | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const displaySlug = slugTouched ? slug : slugifyBase(title);

  const analysis = useMemo(
    () =>
      analyzeSeo({
        title,
        slug: displaySlug,
        metaTitle,
        metaDescription,
        focusKeyword,
        contentHtml: content,
      }),
    [title, displaySlug, metaTitle, metaDescription, focusKeyword, content]
  );

  async function handleSuggestKeywords() {
    if (!title.trim()) {
      setSuggestError("Vui lòng nhập tiêu đề trước khi gợi ý từ khóa.");
      return;
    }
    setSuggesting(true);
    setSuggestError(null);
    setKeywordSuggestion(null);

    const res = await fetch("/api/admin/seo-keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt, category }),
    });
    const data = await res.json().catch(() => ({}));
    setSuggesting(false);

    if (!res.ok) {
      setSuggestError(typeof data.error === "string" ? data.error : "Không lấy được gợi ý, vui lòng thử lại.");
      return;
    }
    setKeywordSuggestion(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coverImage) {
      setError("Vui lòng chọn ảnh bìa");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title,
      slug: displaySlug,
      excerpt,
      content,
      coverImage,
      category,
      published,
      metaTitle,
      metaDescription,
      focusKeyword,
      placeId: placeId || null,
    };
    const res = await fetch(isEdit ? `/api/news/${initial!.id}` : "/api/news", {
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

    router.push("/admin/news");
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start max-w-5xl">
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5">
      <ImageUploader label="Ảnh bìa" value={coverImage} onChange={setCoverImage} folder="news" />

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tiêu đề</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Kinh nghiệm du lịch Phan Thiết mùa hè"
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Đường dẫn (slug)</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 shrink-0">/tin-tuc/</span>
          <input
            value={displaySlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugifyBase(e.target.value));
            }}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
          {slugTouched && (
            <button
              type="button"
              onClick={() => {
                setSlugTouched(false);
                setSlug("");
              }}
              className="shrink-0 text-xs font-semibold text-brand-blue hover:underline"
            >
              Tự sinh lại
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[13px] text-slate-500 font-medium">Từ khóa chính (focus keyword)</label>
          <button
            type="button"
            onClick={handleSuggestKeywords}
            disabled={suggesting}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline disabled:opacity-50"
          >
            <i className={`fa-solid ${suggesting ? "fa-spinner fa-spin" : "fa-wand-magic-sparkles"}`} aria-hidden="true" />
            {suggesting ? "Đang gợi ý..." : "Gợi ý từ khóa (AI)"}
          </button>
        </div>
        <input
          value={focusKeyword}
          onChange={(e) => setFocusKeyword(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="VD: kinh nghiệm du lịch Phan Thiết"
        />
        <p className="text-xs text-slate-400 mt-1">Cụm từ chính bạn muốn bài viết này xếp hạng trên Google.</p>

        {suggestError && <p className="text-xs text-brand-red mt-2">{suggestError}</p>}

        {keywordSuggestion && (
          <div className="mt-3 border border-brand-sky bg-brand-sky/40 rounded-xl p-3 space-y-2.5">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Từ khóa chính gợi ý</p>
              <button
                type="button"
                onClick={() => setFocusKeyword(keywordSuggestion.focusKeyword)}
                className="text-sm font-bold text-brand-blue bg-white border border-brand-blueMid rounded-full px-3 py-1 hover:bg-brand-tint"
              >
                {keywordSuggestion.focusKeyword} <i className="fa-solid fa-arrow-right ml-1 text-xs" aria-hidden="true" />
              </button>
            </div>
            {keywordSuggestion.related.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Từ khóa liên quan (nên nhắc tới trong bài)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {keywordSuggestion.related.map((kw) => (
                    <span key={kw} className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-2.5 py-1">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mô tả ngắn</label>
        <textarea
          required
          maxLength={500}
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Tóm tắt hiển thị ở trang chủ (tối đa 500 ký tự)"
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Danh mục</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Địa điểm liên quan (không bắt buộc)</label>
        <select
          value={placeId}
          onChange={(e) => setPlaceId(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        >
          <option value="">— Không gắn với địa điểm nào —</option>
          {places.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">
          Khi chọn, trang bài viết sẽ tự hiện bản đồ, giờ mở cửa, giá, đánh giá và số điện thoại thật của địa điểm này.
        </p>
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Nội dung</label>
        <RichTextEditor value={content} onChange={setContent} uploadFolder="news" />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="w-4 h-4"
        />
        Xuất bản ngay (hiển thị ở trang chủ)
      </label>

      <div className="border-t border-slate-100 pt-5 space-y-4">
        <div>
          <p className="font-bold text-slate-700 text-sm">SEO bài viết</p>
          <p className="text-xs text-slate-400 mt-0.5">Để trống sẽ tự lấy Tiêu đề / Mô tả ngắn ở trên làm mặc định.</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[13px] text-slate-500 font-medium">Tiêu đề SEO (thẻ title)</label>
            <CharCounter value={metaTitle} max={70} />
          </div>
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder={title || "Tiêu đề bài viết"}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[13px] text-slate-500 font-medium">Mô tả SEO (meta description)</label>
            <CharCounter value={metaDescription} max={160} />
          </div>
          <textarea
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder={excerpt || "Mô tả ngắn hiển thị trên Google"}
          />
        </div>

        <div>
          <p className="text-[13px] text-slate-500 font-medium mb-1.5">Xem trước trên Google</p>
          <div className="border border-slate-200 rounded-xl px-4 py-3 bg-slate-50">
            <p className="text-[13px] text-brand-green leading-tight truncate">
              bookingphanthiet.com › tin-tuc › {displaySlug || "..."}
            </p>
            <p className="text-[#1a0dab] text-lg leading-snug truncate">{metaTitle || title || "Tiêu đề bài viết"}</p>
            <p className="text-sm text-slate-600 leading-snug line-clamp-2">
              {metaDescription || excerpt || "Mô tả ngắn sẽ hiện ở đây trên kết quả tìm kiếm Google."}
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Đăng bài"}
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

    <div className="bg-white rounded-2xl shadow-card p-5 lg:sticky lg:top-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-700 text-sm">Phân tích SEO</p>
        <span className={`text-sm font-extrabold ${analysis.scoreColor}`}>{analysis.score}/100 · {analysis.scoreLabel}</span>
      </div>
      <ul className="space-y-3">
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
    </div>
  );
}

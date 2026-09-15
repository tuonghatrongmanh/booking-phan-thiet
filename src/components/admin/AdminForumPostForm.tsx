"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MediaUploader, { type MediaItem } from "@/components/forum/MediaUploader";
import { FORUM_CATEGORIES, POST_TYPES, type ForumSlug, type PostTypeKey } from "@/lib/forum";

const SLUGS = Object.keys(FORUM_CATEGORIES) as ForumSlug[];
const TYPE_KEYS = Object.keys(POST_TYPES) as PostTypeKey[];

export default function AdminForumPostForm() {
  const router = useRouter();

  const [category, setCategory] = useState<ForumSlug>(SLUGS[0]);
  const [postType, setPostType] = useState<PostTypeKey>("POST");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, title, content, postType, media }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }

    router.push("/admin/forum");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Danh mục diễn đàn</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ForumSlug)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          >
            {SLUGS.map((slug) => (
              <option key={slug} value={slug}>
                {FORUM_CATEGORIES[slug].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Loại bài đăng</label>
          <select
            value={postType}
            onChange={(e) => setPostType(e.target.value as PostTypeKey)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          >
            {TYPE_KEYS.map((key) => (
              <option key={key} value={key}>
                {POST_TYPES[key].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tiêu đề</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Tiêu đề bài đăng"
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Nội dung</label>
        <textarea
          required
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Nội dung bài đăng... (dùng #hashtag để gắn chủ đề)"
        />
      </div>

      <div>
        <p className="text-[13px] text-slate-500 font-medium mb-1.5">Ảnh/Video minh hoạ (tối đa 8)</p>
        <div className="flex flex-wrap gap-3">
          {media.map((m, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group bg-slate-900">
              {m.type === "VIDEO" ? (
                <video src={m.url} className="w-full h-full object-cover" muted />
              ) : (
                <Image src={m.url} alt="" fill className="object-cover" />
              )}
              <button
                type="button"
                onClick={() => setMedia((items) => items.filter((_, idx) => idx !== i))}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
              >
                Xoá
              </button>
            </div>
          ))}
          {media.length < 8 && <MediaUploader onAdd={(item) => setMedia((items) => [...items, item])} />}
        </div>
      </div>

      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {saving ? "Đang đăng..." : "Đăng bài"}
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

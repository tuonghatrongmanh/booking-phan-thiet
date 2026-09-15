"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function extractYoutubeId(url: string): string | null {
  const trimmed = url.trim();
  const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/);
  if (match) return match[1];
  return /^[A-Za-z0-9_-]{6,20}$/.test(trimmed) ? trimmed : null;
}

type GuideVideoInitial = {
  id?: string;
  title: string;
  videoUrl: string;
  caption: string | null;
  sortOrder: number;
  active: boolean;
};

export default function GuideVideoForm({ initial }: { initial?: GuideVideoInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder?.toString() ?? "0");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = extractYoutubeId(videoUrl);
    if (!id) {
      setError("Link YouTube không hợp lệ");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title,
      videoUrl: id,
      caption: caption || undefined,
      sortOrder: Number(sortOrder) || 0,
      active,
    };

    const res = await fetch(isEdit ? `/api/guide-videos/${initial!.id}` : "/api/guide-videos", {
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

    router.push("/admin/guide-videos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-2xl">
      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tiêu đề</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Cách lấy link video TikTok"
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link video YouTube</label>
        <input
          required
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Chú thích (tùy chọn)</label>
        <textarea
          rows={2}
          value={caption ?? ""}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Thứ tự hiển thị</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 pt-7">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
          Hiển thị cho Sale uy tín
        </label>
      </div>

      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm video"}
        </button>
        <button type="button" onClick={() => router.back()} className="text-slate-500 font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl">
          Hủy
        </button>
      </div>
    </form>
  );
}

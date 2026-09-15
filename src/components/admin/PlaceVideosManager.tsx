"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

const MAX_VIDEOS = 6;

type PlaceVideo = {
  id: string;
  sourceUrl: string;
  title: string | null;
  thumbnailUrl: string | null;
};

export default function PlaceVideosManager({ placeId, videos }: { placeId: string; videos: PlaceVideo[] }) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const full = videos.length >= MAX_VIDEOS;

  async function handleAdd() {
    if (!sourceUrl.trim()) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/places/${placeId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceUrl: sourceUrl.trim() }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Không thể thêm video");
      return;
    }

    setSourceUrl("");
    router.refresh();
  }

  async function handleDelete(videoId: string) {
    if (!(await confirm("Xóa video này?"))) return;
    const res = await fetch(`/api/places/${placeId}/videos/${videoId}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Không thể xóa video", "error");
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="font-display font-bold text-lg text-slate-800 mb-1">Video review TikTok</h2>
      <p className="text-xs text-slate-400 mb-4">
        Dán link video TikTok — hệ thống tự lấy ảnh thumbnail + tiêu đề thật. Tối đa {MAX_VIDEOS} video.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {videos.map((v) => (
          <div key={v.id} className="border border-slate-100 rounded-xl overflow-hidden">
            <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-video bg-slate-100">
              {v.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                  <i className="fa-brands fa-tiktok text-2xl" aria-hidden="true" />
                </div>
              )}
            </a>
            <div className="p-2.5 flex items-center justify-between gap-2">
              <p className="text-xs text-slate-600 line-clamp-2">{v.title || v.sourceUrl}</p>
              <button
                onClick={() => handleDelete(v.id)}
                className="text-brand-red text-xs font-bold hover:bg-brand-redBg rounded px-2 py-1 shrink-0"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
        {videos.length === 0 && <p className="col-span-full text-sm text-slate-400">Chưa có video nào.</p>}
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          disabled={full}
          placeholder="https://www.tiktok.com/@..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:bg-slate-50"
        />
        {full && <p className="text-xs text-amber-600">Đã đủ {MAX_VIDEOS} video — xoá 1 video trước khi thêm mới.</p>}
        {error && <p className="text-xs text-brand-red">{error}</p>}
        <button
          onClick={handleAdd}
          disabled={!sourceUrl.trim() || saving || full}
          className="text-sm font-bold text-white bg-brand-blue hover:brightness-95 transition rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Đang thêm..." : "+ Thêm video"}
        </button>
      </div>
    </div>
  );
}

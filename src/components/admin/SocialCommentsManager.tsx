"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";

type SocialComment = {
  id: string;
  imageUrl: string;
  platform: string;
  authorName: string | null;
  note: string | null;
};

const PLATFORMS = [
  { value: "FACEBOOK", label: "Facebook" },
  { value: "ZALO", label: "Zalo" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "OTHER", label: "Khác" },
];

export default function SocialCommentsManager({
  placeId,
  comments,
}: {
  placeId: string;
  comments: SocialComment[];
}) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [imageUrl, setImageUrl] = useState("");
  const [platform, setPlatform] = useState("FACEBOOK");
  const [authorName, setAuthorName] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!imageUrl) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/places/${placeId}/social-comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl,
        platform,
        authorName: authorName || undefined,
        note: note || undefined,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Không thể thêm bằng chứng");
      return;
    }

    setImageUrl("");
    setAuthorName("");
    setNote("");
    router.refresh();
  }

  async function handleDelete(commentId: string) {
    if (!(await confirm("Xóa ảnh bằng chứng này?"))) return;
    await fetch(`/api/places/${placeId}/social-comments/${commentId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="font-display font-bold text-lg text-slate-800 mb-1">Bằng chứng bình luận mạng xã hội</h2>
      <p className="text-xs text-slate-400 mb-4">
        Ảnh chụp màn hình bình luận/đánh giá thật từ Facebook, Zalo, TikTok... để tăng độ tin cậy.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {comments.map((c) => (
          <div key={c.id} className="border border-slate-100 rounded-xl overflow-hidden">
            <div className="relative w-full aspect-video bg-slate-100">
              <Image src={c.imageUrl} alt="" fill className="object-cover" />
            </div>
            <div className="p-2.5 flex items-center justify-between">
              <div className="text-xs">
                <p className="font-semibold text-slate-700">{c.authorName || "Ẩn danh"}</p>
                <p className="text-slate-400">{PLATFORMS.find((p) => p.value === c.platform)?.label}</p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-brand-red text-xs font-bold hover:bg-brand-redBg rounded px-2 py-1"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="col-span-full text-sm text-slate-400">Chưa có bằng chứng nào.</p>
        )}
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <ImageUploader
          label="Ảnh chụp màn hình bình luận"
          value={imageUrl}
          onChange={setImageUrl}
          folder={`places/${placeId}/social-comments`}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Tên người bình luận (tùy chọn)"
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú thêm (tùy chọn)"
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
        {error && <p className="text-xs text-brand-red">{error}</p>}
        <button
          onClick={handleAdd}
          disabled={!imageUrl || saving}
          className="text-sm font-bold text-white bg-brand-blue hover:brightness-95 transition rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Đang thêm..." : "+ Thêm bằng chứng"}
        </button>
      </div>
    </div>
  );
}

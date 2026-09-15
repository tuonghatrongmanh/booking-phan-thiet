"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";

type Review = {
  id: string;
  reviewerName: string;
  rating: number;
  content: string;
  trustLabel: string;
  likes: number;
  images: { id: string; url: string }[];
};

export default function ReviewsManager({ placeId, reviews }: { placeId: string; reviews: Review[] }) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [trustLabel, setTrustLabel] = useState("Uy tín");
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!reviewerName || !content) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/places/${placeId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerName, rating, content, trustLabel, images }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Không thể thêm đánh giá");
      return;
    }

    setReviewerName("");
    setContent("");
    setRating(5);
    setImages([]);
    router.refresh();
  }

  async function handleDelete(reviewId: string) {
    if (!(await confirm("Xóa đánh giá này?"))) return;
    await fetch(`/api/places/${placeId}/reviews/${reviewId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="font-display font-bold text-lg text-slate-800 mb-4">Đánh giá (hiển thị ở trang chủ)</h2>

      <div className="space-y-3 mb-5">
        {reviews.map((r) => (
          <div key={r.id} className="border border-slate-100 rounded-xl p-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-sm text-slate-800">
                {r.reviewerName} · <span className="text-brand-gold">{"★".repeat(r.rating)}</span>
              </p>
              <p className="text-sm text-slate-500">{r.content}</p>
              <span className="inline-block mt-1 text-[10px] font-bold text-brand-green bg-brand-greenBg px-2 py-0.5 rounded-full">
                {r.trustLabel}
              </span>
              {r.images.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {r.images.map((img) => (
                    <div key={img.id} className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                      <Image src={img.url} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              className="text-brand-red text-xs font-bold hover:bg-brand-redBg rounded px-2 py-1 shrink-0"
            >
              Xóa
            </button>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-sm text-slate-400">Chưa có đánh giá nào.</p>}
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Tên người đánh giá"
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} sao
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Nội dung đánh giá..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
        <input
          value={trustLabel}
          onChange={(e) => setTrustLabel(e.target.value)}
          placeholder="Nhãn (VD: Uy tín)"
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />

        <div>
          <p className="text-[13px] text-slate-500 font-medium mb-1.5">Ảnh minh chứng (tối đa 8 ảnh)</p>
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                >
                  Xóa
                </button>
              </div>
            ))}
            {images.length < 8 && (
              <ImageUploader
                label=""
                value=""
                onChange={(url) => setImages((imgs) => [...imgs, url])}
                folder="reviews"
              />
            )}
          </div>
        </div>

        {error && <p className="text-xs text-brand-red">{error}</p>}
        <button
          onClick={handleAdd}
          disabled={!reviewerName || !content || saving}
          className="text-sm font-bold text-white bg-brand-blue hover:brightness-95 transition rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Đang thêm..." : "+ Thêm đánh giá"}
        </button>
      </div>
    </div>
  );
}

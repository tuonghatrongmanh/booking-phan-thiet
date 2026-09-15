"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";

type ReviewInitial = {
  id?: string;
  placeId?: string;
  placeName?: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  rating: number;
  content: string;
  trustLabel: string;
  likes: number;
  images: { id: string; url: string }[];
};

export default function ReviewForm({
  initial,
  places,
}: {
  initial?: ReviewInitial;
  places?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [placeId, setPlaceId] = useState(initial?.placeId ?? places?.[0]?.id ?? "");
  const [reviewerName, setReviewerName] = useState(initial?.reviewerName ?? "");
  const [reviewerAvatar, setReviewerAvatar] = useState(initial?.reviewerAvatar ?? "");
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [content, setContent] = useState(initial?.content ?? "");
  const [trustLabel, setTrustLabel] = useState(initial?.trustLabel ?? "Uy tín");
  const [likes, setLikes] = useState(initial?.likes?.toString() ?? "0");
  const [images, setImages] = useState<string[]>(initial?.images.map((i) => i.url) ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEdit && !placeId) {
      setError("Vui lòng chọn địa điểm cho đánh giá này");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = isEdit
      ? {
          reviewerName,
          reviewerAvatar: reviewerAvatar || null,
          rating,
          content,
          trustLabel,
          likes: Number(likes) || 0,
          images,
        }
      : {
          placeId,
          reviewerName,
          reviewerAvatar: reviewerAvatar || undefined,
          rating,
          content,
          trustLabel,
          likes: Number(likes) || 0,
          images,
        };

    const res = await fetch(isEdit ? `/api/reviews/${initial!.id}` : "/api/reviews", {
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

    router.push("/admin/reviews");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-2xl">
      {isEdit ? (
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Địa điểm</label>
          <p className="text-[15px] text-slate-700 bg-slate-50 rounded-xl px-3 py-2.5">{initial?.placeName}</p>
        </div>
      ) : (
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Địa điểm</label>
          <select
            required
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          >
            {places?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <ImageUploader label="Avatar người đánh giá (không bắt buộc)" value={reviewerAvatar} onChange={setReviewerAvatar} folder="reviews" />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tên người đánh giá</label>
          <input
            required
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Nguyễn Thị Bích"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số sao</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} sao
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Nội dung đánh giá</label>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Homestay rất đẹp, chủ nhà thân thiện..."
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Nhãn (VD: Uy tín, Cảnh báo lừa đảo)</label>
          <input
            value={trustLabel}
            onChange={(e) => setTrustLabel(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số lượt tim</label>
          <input
            type="number"
            min={0}
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
      </div>

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
            <ImageUploader label="" value="" onChange={(url) => setImages((imgs) => [...imgs, url])} folder="reviews" />
          )}
        </div>
      </div>

      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm đánh giá"}
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

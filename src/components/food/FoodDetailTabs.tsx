"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaUploader from "@/components/forum/MediaUploader";

type ReviewItem = {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  user: { name: string; avatar: string };
  images: { url: string }[];
};

type RatingBreakdownItem = { label: string; pct: number };

const TABS = ["Giới thiệu", "Đánh giá", "Video review", "Ảnh thực tế", "Bản đồ & Thông tin"] as const;

function timeAgo(iso: string): string {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

function StarRow({ value, size = "text-sm" }: { value: number; size?: string }) {
  return (
    <span className={size}>
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={i < Math.round(value) ? "fa-solid fa-star text-food-rating" : "fa-solid fa-star text-slate-200"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function ReviewForm({ foodId, onSubmitted }: { foodId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/foods/${foodId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, content, images }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }

    setContent("");
    setImages([]);
    setRating(5);
    onSubmitted();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-food-light rounded-2xl p-4 space-y-3">
      <p className="text-sm font-bold text-food-text">Viết đánh giá của bạn</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} sao`}>
            <i
              className={n <= rating ? "fa-solid fa-star text-food-rating text-xl" : "fa-solid fa-star text-slate-300 text-xl"}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <textarea
        required
        minLength={10}
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Cảm nghĩ của bạn về món ăn này..."
        className="w-full border border-[#E3ECF5] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-food-primary/30 bg-white"
      />
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url) => (
            <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((cur) => cur.filter((u) => u !== url))}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <MediaUploader folder="food-reviews" multiple max={5 - images.length} onAdd={(item) => item.type === "IMAGE" && setImages((cur) => [...cur, item.url])} />
        {error && <p className="text-xs text-brand-red">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="bg-food-primary hover:brightness-95 transition text-white text-sm font-bold rounded-full px-5 py-2 disabled:opacity-60"
        >
          {saving ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </div>
    </form>
  );
}

export default function FoodDetailTabs({
  foodId,
  description,
  contentHtml,
  verified,
  verifiedStampImage,
  reviews,
  ratingAverage,
  ratingTotal,
  ratingBreakdown,
  isLoggedIn,
  videoId,
  videoCaption,
  images,
  mapEmbedUrl,
  googleMapsUrl,
  openingHours,
  phone,
  websiteUrl,
  fanpageUrl,
  restaurant,
}: {
  foodId: string;
  description: string;
  contentHtml: string;
  verified: boolean;
  verifiedStampImage: string | null;
  reviews: ReviewItem[];
  ratingAverage: number;
  ratingTotal: number;
  ratingBreakdown: RatingBreakdownItem[];
  isLoggedIn: boolean;
  videoId: string | null;
  videoCaption: string | null;
  images: { url: string }[];
  mapEmbedUrl: string | null;
  googleMapsUrl: string;
  openingHours: string | null;
  phone: string | null;
  websiteUrl: string | null;
  fanpageUrl: string | null;
  restaurant: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Giới thiệu");

  return (
    <div>
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-[#E8EEF5] mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition ${
              tab === t ? "border-food-primary text-food-primary" : "border-transparent text-food-textMuted hover:text-food-text"
            }`}
          >
            {t === "Đánh giá" ? `${t} (${ratingTotal})` : t}
          </button>
        ))}
      </div>

      {tab === "Giới thiệu" && (
        <div className="space-y-6">
          <div>
            <p className="font-display font-bold text-lg text-food-text mb-2 flex items-center gap-2">
              <i className="fa-solid fa-utensils text-food-primary" aria-hidden="true" /> Giới thiệu món ăn
            </p>
            <p className="text-food-textGray leading-relaxed mb-4">{description}</p>
            {contentHtml && (
              <div className="article-content text-[15px] text-food-textGray leading-relaxed" dangerouslySetInnerHTML={{ __html: contentHtml }} />
            )}
          </div>

          {verified && (
            <div className="bg-brand-greenBg border border-green-200 rounded-2xl p-5 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-brand-green mb-1.5 flex items-center gap-2">
                  <i className="fa-solid fa-circle-check" aria-hidden="true" /> Đã kiểm chứng &amp; xác thực
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  Món ăn này đã được đội ngũ admin của BookingPhanThiet.com kiểm chứng thực tế tại nhà hàng, đảm bảo chất lượng thông tin mô tả.
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {["Đúng địa chỉ, đúng món ăn", "Giá cả minh bạch", "Chất lượng và vệ sinh an toàn thực phẩm"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <i className="fa-solid fa-check text-brand-green" aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              {verifiedStampImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={verifiedStampImage} alt="Đã kiểm chứng" className="w-24 h-24 object-contain shrink-0" />
              )}
            </div>
          )}
        </div>
      )}

      {tab === "Đánh giá" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="font-display font-bold text-lg text-food-text flex items-center gap-2">
              <i className="fa-solid fa-users text-food-primary" aria-hidden="true" /> Đánh giá từ cộng đồng
            </p>
          </div>

          <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-center bg-food-light rounded-2xl p-5">
            <div className="text-center">
              <p className="font-display font-extrabold text-4xl text-food-text">{ratingAverage.toFixed(1)}/5</p>
              <StarRow value={ratingAverage} size="text-base" />
              <p className="text-xs text-food-textMuted mt-1">{ratingTotal} đánh giá</p>
            </div>
            <div className="space-y-1.5">
              {ratingBreakdown.map((b) => (
                <div key={b.label} className="flex items-center gap-2 text-xs">
                  <span className="w-24 shrink-0 text-food-textMuted">{b.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-white overflow-hidden">
                    <div className="h-full bg-food-primary rounded-full" style={{ width: `${b.pct}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right text-food-textMuted">{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {isLoggedIn ? (
            <ReviewForm foodId={foodId} onSubmitted={() => router.refresh()} />
          ) : (
            <p className="text-sm text-food-textMuted bg-food-light rounded-xl px-4 py-3">
              <a href="/dang-nhap" className="text-food-primary font-bold hover:underline">
                Đăng nhập
              </a>{" "}
              để viết đánh giá cho món ăn này.
            </p>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-food-textMuted text-center py-6">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border-b border-[#EEF3F8] pb-4">
                  <div className="flex items-center gap-3 mb-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover bg-slate-100" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-food-text">{r.user.name}</p>
                      <div className="flex items-center gap-1.5">
                        <StarRow value={r.rating} />
                        <span className="text-xs text-food-textMuted">{timeAgo(r.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-food-textGray leading-relaxed mb-2">{r.content}</p>
                  {r.images.length > 0 && (
                    <div className="flex gap-2">
                      {r.images.map((img, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={img.url} alt="" className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "Video review" && (
        <div>
          {videoId ? (
            <div>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={videoCaption || "Video review"}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              {videoCaption && <p className="text-sm font-bold text-food-text mt-3">{videoCaption}</p>}
            </div>
          ) : (
            <p className="text-sm text-food-textMuted text-center py-10">Chưa có video review cho món ăn này.</p>
          )}
        </div>
      )}

      {tab === "Ảnh thực tế" && (
        <div>
          {images.length === 0 ? (
            <p className="text-sm text-food-textMuted text-center py-10">Chưa có ảnh thực tế.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img.url} alt="" className="w-full aspect-square rounded-xl object-cover bg-slate-100" />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Bản đồ & Thông tin" && (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-food-light">
            {mapEmbedUrl ? (
              <iframe src={mapEmbedUrl} className="absolute inset-0 w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-food-primary/30 text-4xl">
                <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
              </div>
            )}
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-food-primary font-bold text-sm hover:underline"
          >
            <i className="fa-solid fa-diamond-turn-right" aria-hidden="true" /> Xem đường đi
          </a>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <p className="font-bold text-sm text-food-text mb-1.5 flex items-center gap-2">
                <i className="fa-regular fa-clock text-food-primary" aria-hidden="true" /> Giờ mở cửa
              </p>
              <p className="text-sm text-food-textGray whitespace-pre-line">{openingHours || "Chưa cập nhật"}</p>
            </div>
            <div>
              <p className="font-bold text-sm text-food-text mb-1.5 flex items-center gap-2">
                <i className="fa-solid fa-circle-info text-food-primary" aria-hidden="true" /> Thông tin thêm
              </p>
              <div className="text-sm text-food-textGray space-y-1">
                <p>{restaurant}</p>
                {phone && <p>Điện thoại: {phone}</p>}
                {websiteUrl && (
                  <p>
                    Website:{" "}
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-food-primary hover:underline">
                      {websiteUrl}
                    </a>
                  </p>
                )}
                {fanpageUrl && (
                  <p>
                    Fanpage:{" "}
                    <a href={fanpageUrl} target="_blank" rel="noopener noreferrer" className="text-food-primary hover:underline">
                      {fanpageUrl}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

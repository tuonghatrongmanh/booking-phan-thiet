import Image from "next/image";

type ReviewImage = { id: string; url: string };
type ReviewItem = {
  id: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  rating: number;
  content: string;
  createdAt: Date;
  images: ReviewImage[];
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function StayReviewsSection({ reviews, avgRating }: { reviews: ReviewItem[]; avgRating: number }) {
  const total = reviews.length;
  const histogram = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      <div className="bg-white border border-[#E6EDF4] rounded-2xl p-5 h-fit">
        <p className="text-4xl font-extrabold text-[#102F4F]">{avgRating.toFixed(1)}</p>
        <div className="text-[#FFB91D] mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <i key={i} className="fa-solid fa-star" style={{ opacity: i < Math.round(avgRating) ? 1 : 0.25 }} aria-hidden="true" />
          ))}
        </div>
        <p className="text-sm text-[#8298AE] mt-1">
          {avgRating >= 4.5 ? "Xuất sắc · " : ""}
          Dựa trên {total} đánh giá
        </p>

        <div className="mt-4 space-y-2">
          {histogram.map((h) => (
            <div key={h.star} className="flex items-center gap-2 text-xs text-[#47647F]">
              <span className="w-8 shrink-0">{h.star} sao</span>
              <div className="flex-1 h-1.5 rounded-full bg-[#E8F0F6] overflow-hidden">
                <div
                  className="h-full bg-brand-blue rounded-full"
                  style={{ width: total > 0 ? `${(h.count / total) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-4 shrink-0 text-right">{h.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-[#8297AC]">Chưa có đánh giá nào cho chỗ nghỉ này.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="bg-[#F8FAFC] rounded-[14px] p-[18px]">
              <div className="flex items-start gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-brand-sky">
                  {r.reviewerAvatar && <Image src={r.reviewerAvatar} alt={r.reviewerName} fill className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-[#102F4F] flex items-center gap-1.5">
                      {r.reviewerName}
                      <i className="fa-solid fa-circle-check text-brand-blue text-xs" aria-hidden="true" />
                    </p>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[#FFB91D] text-xs">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <i key={s} className="fa-solid fa-star" style={{ opacity: s < r.rating ? 1 : 0.25 }} aria-hidden="true" />
                        ))}
                      </span>
                      <span className="text-[11px] font-bold text-white bg-[#16A05D] rounded-full px-2 py-0.5">{r.rating}/5</span>
                    </span>
                  </div>
                  <p className="text-sm text-[#47647F] mt-1">{r.content}</p>
                  {r.images.length > 0 && (
                    <div className="flex gap-2 mt-2.5">
                      {r.images.map((img) => (
                        <div key={img.id} className="relative w-20 h-20 rounded-[10px] overflow-hidden bg-slate-100 shrink-0">
                          <Image src={img.url} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-[#8298AE] mt-2">{formatDate(r.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

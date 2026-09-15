import Image from "next/image";
import SafeImage from "@/components/places/SafeImage";
import ScrollCarousel from "./ScrollCarousel";
import TranslatedField from "@/components/i18n/TranslatedField";
import T from "@/lib/i18n/T";

type ReviewWithPlace = {
  id: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  rating: number;
  content: string;
  trustLabel: string;
  likes: number;
  createdAt: Date;
  place: { name: string };
  images: { id: string; url: string }[];
};

type ReviewStats = {
  average: number;
  total: number;
  starCounts: number[]; // [5★, 4★, 3★, 2★, 1★]
};

function timeAgo(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Hôm nay";
  if (days === 1) return "1 ngày trước";
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  return `${months} tháng trước`;
}

// Anh minh hoa dung chung khi 1 danh gia chua duoc admin dinh kem anh that (chua co
// ReviewImage nao trong DB) - can them file that vao public/images/danh-gia01.png ...
// danh-gia08.png. Danh gia nao DA co anh that thi luon uu tien hien anh that, khong
// bao gio bi ghi de boi bo anh minh hoa nay.
const FALLBACK_REVIEW_IMAGES = Array.from(
  { length: 8 },
  (_, i) => `/images/danh-gia${String(i + 1).padStart(2, "0")}.png`
);

export default function ReviewSection({
  reviews,
  stats,
}: {
  reviews: ReviewWithPlace[];
  stats: ReviewStats;
}) {
  const maxStar = Math.max(...stats.starCounts, 1);

  return (
    <section className="container-custom py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-800 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a6fc4" strokeWidth="1.8">
              <path d="M12 21s-7-4.5-9.5-9C1 8 3 4 7 4c2.2 0 3.7 1.3 5 3 1.3-1.7 2.8-3 5-3 4 0 6 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" />
            </svg>
            <T id="section.review.title">ĐÁNH GIÁ TỪ CỘNG ĐỒNG</T>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            <T id="section.review.subtitle">Những chia sẻ chân thực từ cộng đồng đã trải nghiệm du lịch Phan Thiết.</T>
          </p>
        </div>
        <a
          href="#"
          className="flex items-center gap-1 text-sm font-bold text-brand-blue border border-sky-200 rounded-full px-4 py-1.5 hover:bg-sky-50 transition-colors shrink-0"
        >
          <T id="section.review.viewAll">Xem tất cả đánh giá</T>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-400">
          <T id="section.review.empty">Chưa có đánh giá nào. Đánh giá thật từ cộng đồng sẽ hiển thị tại đây.</T>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-5">
          {/* summary card */}
          <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col justify-center">
            <p className="font-display font-extrabold text-4xl text-slate-800">
              {stats.average.toFixed(1)}
              <span className="text-lg text-slate-400 font-bold">/5</span>
            </p>
            <span className="text-brand-gold flex mb-3">
              {Array.from({ length: 5 }).map((_, s) => (
                <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity={s < Math.round(stats.average) ? 1 : 0.3}>
                  <path d="M12 2l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 16.9 6.2 20l1.1-6.5L2.5 8.9l6.6-.9L12 2z" />
                </svg>
              ))}
            </span>
            <div className="space-y-1.5 mb-3">
              {[5, 4, 3, 2, 1].map((star, idx) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-semibold w-8 shrink-0">
                    {star} <T id="section.review.starUnit">sao</T>
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-brand-gold rounded-full"
                      style={{ width: `${(stats.starCounts[idx] / maxStar) * 100}%` }}
                    />
                  </div>
                  <span className="text-slate-400 w-6 text-right shrink-0">{stats.starCounts[idx]}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              <T id="section.review.basedOn">Dựa trên</T> {stats.total.toLocaleString("vi-VN")} <T id="section.review.reviewsUnit">đánh giá</T>
            </p>
          </div>

          {/* review cards carousel */}
          <ScrollCarousel>
            {reviews.slice(0, 6).map((review, i) => {
              const isWarning = /cảnh báo|lừa/i.test(review.trustLabel);
              return (
                <div
                  key={review.id}
                  className="relative snap-start shrink-0 w-[80%] sm:w-[45%] lg:w-[calc(33.333%-14px)] bg-white rounded-2xl shadow-card p-4 hover-lift animate-fade-up flex flex-col"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-bold text-brand-red">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#e8483a">
                      <path d="M12 21s-7-4.5-9.5-9C1 8 3 4 7 4c2.2 0 3.7 1.3 5 3 1.3-1.7 2.8-3 5-3 4 0 6 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" />
                    </svg>
                    {review.likes}
                  </span>

                  <div className="flex items-center gap-2.5 mb-2">
                    {review.reviewerAvatar ? (
                      <Image
                        src={review.reviewerAvatar}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                        alt={review.reviewerName}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-sky flex items-center justify-center text-brand-blue font-bold text-sm">
                        {review.reviewerName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm text-slate-800">{review.reviewerName}</p>
                      <p className="text-xs text-slate-400">{timeAgo(review.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-brand-gold flex">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" opacity={s < review.rating ? 1 : 0.3}>
                          <path d="M12 2l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 16.9 6.2 20l1.1-6.5L2.5 8.9l6.6-.9L12 2z" />
                        </svg>
                      ))}
                    </span>
                    {isWarning && (
                      <span className="text-[10px] font-bold text-brand-red bg-brand-redBg px-2 py-0.5 rounded-full ml-1">
                        {review.trustLabel}
                      </span>
                    )}
                  </div>

                  <TranslatedField as="p" model="Review" recordId={review.id} field="content" className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {review.content}
                  </TranslatedField>

                  {(() => {
                    const hasRealImages = review.images.length > 0;
                    const displayImages = hasRealImages
                      ? review.images
                      : FALLBACK_REVIEW_IMAGES.map((url, idx) => ({ id: `fallback-${idx}`, url }));
                    return (
                      <div className="grid grid-cols-4 gap-2 mt-auto">
                        {displayImages.slice(0, 4).map((img, idx) => {
                          const remaining = displayImages.length - 4;
                          const showMore = idx === 3 && remaining > 0;
                          return (
                            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                              <SafeImage src={img.url} alt="" fill className="object-cover" />
                              {showMore && (
                                <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white font-bold text-sm">
                                  +{remaining}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </ScrollCarousel>
        </div>
      )}
    </section>
  );
}

import Link from "next/link";
import type { News } from "@prisma/client";
import ScrollCarousel from "./ScrollCarousel";
import NewsCoverImage from "./NewsCoverImage";

const CATEGORY_BADGE: Record<string, string> = {
  "Kinh nghiệm": "bg-brand-blue",
  "Địa điểm": "bg-amber-500",
  "Ẩm thực": "bg-orange-500",
  "Trải nghiệm": "bg-orange-500",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatViews(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export default function NewsSection({ news }: { news: News[] }) {
  return (
    <section className="container-custom py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-800 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a6fc4" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M7 8h10M7 12h10M7 16h6" />
            </svg>
            TIN TỨC DU LỊCH PHAN THIẾT
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Cập nhật những thông tin, kinh nghiệm du lịch và địa điểm hấp dẫn tại Phan Thiết.
          </p>
        </div>
        <Link
          href="/tin-tuc"
          className="flex items-center gap-1 text-sm font-bold text-brand-blue border border-sky-200 rounded-full px-4 py-1.5 hover:bg-sky-50 transition-colors shrink-0"
        >
          Xem tất cả
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {news.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-400">
          Chưa có bài viết nào. Đăng bài đầu tiên trong trang quản trị.
        </div>
      ) : (
        <ScrollCarousel autoPlay={news.length > 4}>
            {news.map((item, i) => (
              <Link
                key={item.id}
                href={`/tin-tuc/${item.slug}`}
                className="snap-start shrink-0 w-[80%] sm:w-[45%] lg:w-[calc(25%-15px)] bg-white rounded-2xl shadow-card overflow-hidden hover-lift animate-fade-up group"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="relative aspect-square bg-slate-100">
                  <NewsCoverImage src={item.coverImage} alt={item.title} />
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-md uppercase tracking-wide ${
                      CATEGORY_BADGE[item.category] ?? "bg-brand-blue"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-display font-bold text-slate-800 mb-1.5 line-clamp-2 leading-snug">{item.title}</p>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{item.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M3 10h18M8 3v4M16 3v4" />
                      </svg>
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {formatViews(item.views)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </ScrollCarousel>
      )}
    </section>
  );
}

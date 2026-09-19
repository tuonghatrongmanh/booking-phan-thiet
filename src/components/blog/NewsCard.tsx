import Link from "next/link";
import type { News } from "@prisma/client";
import NewsCoverImage from "@/components/home/NewsCoverImage";

export function formatNewsDate(date: Date) {
  return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Card bai viet dung chung cho trang Tin tuc. variant="compact": dang hang ngang (anh nho +
// chu) - de quet nhanh tren dien thoai; variant="grid": the doc anh lon.
export default function NewsCard({ article, variant = "grid" }: { article: News; variant?: "grid" | "compact" }) {
  const meta = (
    <div className="flex items-center gap-3 text-[11px] text-food-textMuted">
      <span className="flex items-center gap-1">
        <i className="fa-regular fa-calendar" aria-hidden="true" /> {formatNewsDate(article.createdAt)}
      </span>
      <span className="flex items-center gap-1">
        <i className="fa-regular fa-eye" aria-hidden="true" /> {article.views.toLocaleString("vi-VN")}
      </span>
    </div>
  );

  if (variant === "compact") {
    return (
      <Link href={`/tin-tuc/${article.slug}`} className="group flex gap-3 bg-white rounded-2xl shadow-game-card p-2.5 hover-lift">
        <div className="relative w-28 h-24 shrink-0 rounded-xl overflow-hidden bg-food-light">
          <NewsCoverImage src={article.coverImage} alt={article.title} fit="cover" />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
          <div>
            <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wide">{article.category}</span>
            <p className="font-display font-bold text-food-text leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">{article.title}</p>
          </div>
          {meta}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/tin-tuc/${article.slug}`} className="group flex flex-col bg-white rounded-2xl shadow-game-card overflow-hidden hover-lift h-full">
      <div className="relative aspect-[16/10] bg-food-light">
        <NewsCoverImage src={article.coverImage} alt={article.title} fit="cover" />
        <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-food-primary px-2.5 py-1 rounded-full uppercase tracking-wide">
          {article.category}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="font-display font-bold text-lg text-food-text leading-snug line-clamp-2 mb-1.5 group-hover:text-brand-blue transition-colors">{article.title}</p>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{article.excerpt}</p>
        {meta}
      </div>
    </Link>
  );
}

import Link from "next/link";
import type { News } from "@prisma/client";
import NewsCoverImage from "@/components/home/NewsCoverImage";
import { formatNewsDate } from "@/components/blog/NewsCard";

export default function BlogFeaturedCard({ article, readingTime }: { article: News; readingTime: number }) {
  return (
    <Link href={`/tin-tuc/${article.slug}`} className="group relative block rounded-3xl overflow-hidden shadow-game-card bg-food-navy hover-lift">
      <div className="relative aspect-[4/3] sm:aspect-[16/8]">
        <NewsCoverImage src={article.coverImage} alt={article.title} fit="cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-food-navy/90 via-food-navy/40 to-transparent" />

        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-food-navy bg-brand-gold px-3 py-1.5 rounded-full uppercase tracking-wide">
          <i className="fa-solid fa-crown" aria-hidden="true" /> Bài nổi bật
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <div className="flex items-center gap-3 text-xs font-semibold text-white/85 mb-2.5 flex-wrap">
            <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1">{article.category}</span>
            <span className="flex items-center gap-1.5">
              <i className="fa-regular fa-clock" aria-hidden="true" /> {readingTime} phút đọc
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fa-regular fa-calendar" aria-hidden="true" /> {formatNewsDate(article.createdAt)}
            </span>
          </div>
          <p className="font-display font-extrabold text-2xl sm:text-4xl leading-[1.15] text-white line-clamp-3 mb-2">{article.title}</p>
          <p className="hidden sm:block text-white/85 leading-relaxed line-clamp-2 max-w-3xl mb-4">{article.excerpt}</p>
          <span className="inline-flex items-center gap-2 bg-white text-brand-blue font-bold text-sm rounded-full px-5 py-2.5 group-hover:bg-brand-gold group-hover:text-food-navy transition-colors">
            Đọc bài viết <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

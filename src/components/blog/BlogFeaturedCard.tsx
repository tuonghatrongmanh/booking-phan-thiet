import Link from "next/link";
import type { News } from "@prisma/client";
import NewsCoverImage from "@/components/home/NewsCoverImage";
import TranslatedField from "@/components/i18n/TranslatedField";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function BlogFeaturedCard({ article, readingTime }: { article: News; readingTime: number }) {
  return (
    <Link
      href={`/tin-tuc/${article.slug}`}
      className="group grid sm:grid-cols-[55%_1fr] bg-white rounded-[24px] shadow-blog-card overflow-hidden hover-lift h-full sm:h-[420px]"
    >
      <div className="relative aspect-[4/3] sm:aspect-auto bg-slate-100">
        <NewsCoverImage src={article.coverImage} alt={article.title} fit="cover" />
        <span className="absolute top-4 left-4 text-[11px] font-bold text-white px-3 py-1.5 rounded-full uppercase tracking-wide bg-blog-featured">
          {article.category}
        </span>
        <span className="absolute bottom-3 left-4 text-xs font-semibold text-white bg-black/45 px-3 py-1 rounded-full flex items-center gap-1.5">
          <i className="fa-regular fa-clock" aria-hidden="true" /> {readingTime} phút đọc
        </span>
      </div>

      <div className="p-6 sm:p-8 flex flex-col justify-center">
        <p className="flex items-center gap-1.5 text-amber-500 font-bold text-sm mb-2.5">
          <i className="fa-solid fa-crown" aria-hidden="true" /> Bài viết nổi bật
        </p>
        <TranslatedField
          as="p"
          model="News"
          recordId={article.id}
          field="title"
          className="font-display font-extrabold text-2xl sm:text-[38px] leading-[1.15] text-slate-800 mb-3 line-clamp-3 group-hover:text-blog-primaryDark transition-colors"
        >
          {article.title}
        </TranslatedField>
        <TranslatedField as="p" model="News" recordId={article.id} field="excerpt" className="text-blog-textMuted leading-relaxed mb-5 line-clamp-3">
          {article.excerpt}
        </TranslatedField>

        <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
          <span className="flex items-center gap-1.5">
            <i className="fa-regular fa-calendar" aria-hidden="true" /> {formatDate(article.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="fa-regular fa-eye" aria-hidden="true" /> {article.views.toLocaleString("vi-VN")}
          </span>
        </div>

        <span className="inline-flex items-center gap-2 border-2 border-blog-primary text-blog-primary font-bold text-sm rounded-full px-5 py-2.5 w-fit group-hover:bg-blog-primary group-hover:text-white transition-colors">
          Đọc tiếp <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

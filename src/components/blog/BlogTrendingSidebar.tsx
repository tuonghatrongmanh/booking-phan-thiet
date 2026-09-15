import Link from "next/link";
import type { News } from "@prisma/client";
import NewsCoverImage from "@/components/home/NewsCoverImage";
import FooterNewsletterInput from "@/components/home/FooterNewsletterInput";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function BlogTrendingSidebar({ trending }: { trending: News[] }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[24px] p-5 shadow-blog-card">
        <p className="flex items-center gap-2 font-display font-bold text-slate-800 mb-3">
          <i className="fa-solid fa-fire text-blog-featured" aria-hidden="true" /> Bài viết được quan tâm
        </p>

        <div>
          {trending.map((item, i) => (
            <Link
              key={item.id}
              href={`/tin-tuc/${item.slug}`}
              className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 group"
            >
              <span className="w-7 h-7 shrink-0 rounded-full bg-blog-primary text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="relative w-20 h-[60px] shrink-0 rounded-xl overflow-hidden bg-slate-100">
                <NewsCoverImage src={item.coverImage} alt={item.title} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-700 line-clamp-2 leading-snug group-hover:text-blog-primaryDark transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>{formatDate(item.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <i className="fa-regular fa-eye" aria-hidden="true" /> {item.views.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div
        className="relative rounded-[24px] p-5 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--color-blog-newsletterFrom), var(--color-blog-newsletterTo))" }}
      >
        <i className="fa-solid fa-star text-white/15 text-4xl absolute top-3 right-4" aria-hidden="true" />
        <i className="fa-solid fa-shrimp text-white/15 text-3xl absolute bottom-3 left-4" aria-hidden="true" />
        <i className="fa-solid fa-envelope-open-text text-3xl mb-2.5" aria-hidden="true" />
        <p className="font-display font-bold text-lg leading-snug mb-1">Đừng bỏ lỡ tin tức mới!</p>
        <p className="text-white/85 text-sm mb-4">Nhận bài viết mới nhất về Phan Thiết mỗi tuần.</p>
        <form className="flex items-center bg-white/15 border border-white/30 rounded-full p-1 pl-3">
          <FooterNewsletterInput />
          <button
            type="button"
            aria-label="Đăng ký"
            className="w-9 h-9 shrink-0 rounded-full bg-white text-blog-primaryDark flex items-center justify-center"
          >
            <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { News } from "@prisma/client";
import NewsCoverImage from "@/components/home/NewsCoverImage";
import ScrollCarousel from "@/components/home/ScrollCarousel";
import TranslatedField from "@/components/i18n/TranslatedField";

const CATEGORY_BADGE: Record<string, string> = {
  "Kinh nghiệm": "bg-brand-blue",
  "Địa điểm": "bg-amber-500",
  "Ẩm thực": "bg-orange-500",
  "Trải nghiệm": "bg-orange-500",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Danh sach bai viet moi nhat dat NGAY DUOI card noi bat (cung cot giua) o dang
// carousel tu cuon trai->phai (tai su dung ScrollCarousel da co o trang chu), thay
// cho 1 section rieng chiem full-width nhu ban truoc - dung y "duoi la carousel"
// trong feedback cua user, dong thoi giam noi dung du/thua.
export default function BlogLatestCarousel({ items }: { items: News[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-5">
      <p className="flex items-center gap-2 font-display font-bold text-slate-800 mb-1">
        <i className="fa-solid fa-fire text-blog-featured" aria-hidden="true" /> Bài viết mới nhất
      </p>
      <ScrollCarousel autoPlay={items.length > 2}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/tin-tuc/${item.slug}`}
            className="snap-start shrink-0 w-[220px] bg-white rounded-[18px] border border-slate-100 shadow-blog-card overflow-hidden hover-lift group"
          >
            <div className="relative h-[130px] bg-slate-100">
              <NewsCoverImage src={item.coverImage} alt={item.title} />
              <span
                className={`absolute top-2.5 left-2.5 text-[10px] font-bold text-white px-2 py-1 rounded-md uppercase tracking-wide ${
                  CATEGORY_BADGE[item.category] ?? "bg-brand-blue"
                }`}
              >
                {item.category}
              </span>
            </div>
            <div className="p-3.5">
              <TranslatedField
                as="p"
                model="News"
                recordId={item.id}
                field="title"
                className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-blog-primaryDark transition-colors"
              >
                {item.title}
              </TranslatedField>
              <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                <span>{formatDate(item.createdAt)}</span>
                <span className="flex items-center gap-1">
                  <i className="fa-regular fa-eye" aria-hidden="true" /> {item.views.toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </ScrollCarousel>
    </div>
  );
}

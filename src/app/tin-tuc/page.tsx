import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/page-seo";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import NewsCoverImage from "@/components/home/NewsCoverImage";
import Pagination from "@/components/places/Pagination";
import BlogHero from "@/components/blog/BlogHero";
import BlogCategorySidebar from "@/components/blog/BlogCategorySidebar";
import BlogFeaturedCard from "@/components/blog/BlogFeaturedCard";
import BlogTrendingSidebar from "@/components/blog/BlogTrendingSidebar";
import BlogLatestCarousel from "@/components/blog/BlogLatestCarousel";
import { estimateReadingTime } from "@/lib/article-content";
import { toDisplayHtml } from "@/lib/sanitize-html";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;
const CATEGORIES = ["Kinh nghiệm", "Địa điểm", "Ẩm thực", "Trải nghiệm"];

const CATEGORY_BADGE: Record<string, string> = {
  "Kinh nghiệm": "bg-brand-blue",
  "Địa điểm": "bg-amber-500",
  "Ẩm thực": "bg-orange-500",
  "Trải nghiệm": "bg-orange-500",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/tin-tuc");
}

export default async function TinTucPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string; view?: string }>;
}) {
  const { page: pageParam, category, q, view } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const activeCategory = category && CATEGORIES.includes(category) ? category : undefined;
  const keyword = q?.trim();

  const showMagazine = page === 1 && !activeCategory && !keyword && view !== "all";

  if (showMagazine) {
    const [totalCount, categoryCounts, featured, trending] = await Promise.all([
      prisma.news.count({ where: { published: true } }),
      Promise.all(CATEGORIES.map((c) => prisma.news.count({ where: { published: true, category: c } }))),
      prisma.news.findFirst({ where: { published: true }, orderBy: { createdAt: "desc" } }),
      prisma.news.findMany({ where: { published: true }, orderBy: { views: "desc" }, take: 5 }),
    ]);

    if (!featured) {
      return (
        <>
          <Header />
          <BlogHero />
          <div className="bg-blog-bg py-16 text-center text-slate-400">Chưa có bài viết nào. Đăng bài đầu tiên trong trang quản trị.</div>
          <Footer />
        </>
      );
    }

    const latestCarousel = await prisma.news.findMany({
      where: { published: true, id: { not: featured.id } },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const readingTime = estimateReadingTime(toDisplayHtml(featured.content));
    const categoryList = CATEGORIES.map((name, i) => ({ name, count: categoryCounts[i] }));

    return (
      <>
        <Header />
        <div className="bg-blog-bg">
          <BlogHero />

          <div className="max-w-[1500px] mx-auto px-6 pt-8 pb-12">
            <div className="grid lg:grid-cols-[260px_1fr_300px] gap-6 items-start">
              <BlogCategorySidebar categories={categoryList} totalCount={totalCount} />

              <div className="min-w-0">
                <BlogFeaturedCard article={featured} readingTime={readingTime} />
                <BlogLatestCarousel items={latestCarousel} />
              </div>

              <BlogTrendingSidebar trending={trending} />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // --- Che do danh sach thuong (loc danh muc / tim kiem / phan trang) ---
  const where = {
    published: true,
    ...(activeCategory ? { category: activeCategory } : {}),
    ...(keyword ? { OR: [{ title: { contains: keyword } }, { excerpt: { contains: keyword } }] } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.news.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.news.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(p: number) {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (keyword) params.set("q", keyword);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/tin-tuc?${qs}` : "/tin-tuc";
  }

  return (
    <>
      <Header />

      <section className="bg-navbar-gradient py-10">
        <div className="container-custom">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">Tin tức du lịch Phan Thiết</h1>
          <p className="text-white/80 mt-1.5">
            {keyword ? (
              <>Kết quả tìm kiếm cho &quot;<span className="font-bold">{keyword}</span>&quot;</>
            ) : (
              "Kinh nghiệm, địa điểm, ẩm thực và trải nghiệm mới nhất tại Phan Thiết."
            )}
          </p>
        </div>
      </section>

      <section className="container-custom py-8">
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none mb-7">
          <Link
            href="/tin-tuc"
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
              !activeCategory ? "bg-brand-blue border-brand-blue text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-brand-sky"
            }`}
          >
            Tất cả
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/tin-tuc?category=${encodeURIComponent(c)}`}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                activeCategory === c ? "bg-brand-blue border-brand-blue text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-brand-sky"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-400">
            {keyword ? "Không tìm thấy bài viết phù hợp." : "Chưa có bài viết nào ở danh mục này."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/tin-tuc/${item.slug}`}
                className="bg-white rounded-2xl shadow-card overflow-hidden hover-lift group"
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
                    <span>{formatDate(item.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-eye" aria-hidden="true" /> {item.views.toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
        </div>
      </section>

      <Footer />
    </>
  );
}

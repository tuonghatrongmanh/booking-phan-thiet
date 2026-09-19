import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/page-seo";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ScrollTopButton from "@/components/home/ScrollTopButton";
import Pagination from "@/components/places/Pagination";
import BlogHero from "@/components/blog/BlogHero";
import BlogFeaturedCard from "@/components/blog/BlogFeaturedCard";
import BlogTrendingSidebar from "@/components/blog/BlogTrendingSidebar";
import NewsCard from "@/components/blog/NewsCard";
import { estimateReadingTime } from "@/lib/article-content";
import { toDisplayHtml } from "@/lib/sanitize-html";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 8;
const LATEST_ON_HOME = 6;
const CATEGORIES = ["Kinh nghiệm", "Địa điểm", "Ẩm thực", "Trải nghiệm"];

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
  // Chuẩn hóa NFC: bàn phím Việt (Unikey...) có thể gõ dạng tổ hợp, DB lưu dạng dựng sẵn
  const keyword = q?.trim().normalize("NFC") || undefined;

  const showMagazine = page === 1 && !activeCategory && !keyword && view !== "all";

  const where = {
    published: true,
    ...(activeCategory ? { category: activeCategory } : {}),
    ...(keyword
      ? { OR: [{ title: { contains: keyword, mode: "insensitive" as const } }, { excerpt: { contains: keyword, mode: "insensitive" as const } }] }
      : {}),
  };

  const [totalCount, categoryCounts, trending, featured] = await Promise.all([
    prisma.news.count({ where: { published: true } }),
    Promise.all(CATEGORIES.map((c) => prisma.news.count({ where: { published: true, category: c } }))),
    prisma.news.findMany({ where: { published: true }, orderBy: { views: "desc" }, take: 5 }),
    showMagazine ? prisma.news.findFirst({ where: { published: true }, orderBy: { createdAt: "desc" } }) : Promise.resolve(null),
  ]);
  const categoryList = CATEGORIES.map((name, i) => ({ name, count: categoryCounts[i] }));

  const [items, total] = showMagazine
    ? [
        featured
          ? await prisma.news.findMany({ where: { published: true, id: { not: featured.id } }, orderBy: { createdAt: "desc" }, take: LATEST_ON_HOME })
          : [],
        totalCount,
      ]
    : await Promise.all([
        prisma.news.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
        prisma.news.count({ where }),
      ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(p: number) {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (keyword) params.set("q", keyword);
    if (view === "all") params.set("view", "all");
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/tin-tuc?${qs}` : "/tin-tuc";
  }

  const heading = showMagazine ? "Bài viết mới nhất" : keyword ? `Kết quả tìm kiếm (${total})` : activeCategory ? `${activeCategory} (${total})` : `Tất cả bài viết (${total})`;

  return (
    <div className="bg-food-bg min-h-screen">
      <Header />
      <BlogHero categories={categoryList} totalCount={totalCount} activeCategory={activeCategory} keyword={keyword} />

      <main className="max-w-[1240px] mx-auto px-6 sm:px-8 py-8">
        {showMagazine && featured && (
          <div className="mb-8">
            <BlogFeaturedCard article={featured} readingTime={estimateReadingTime(toDisplayHtml(featured.content))} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          <section className="min-w-0">
            <h2 className="font-display font-extrabold text-2xl text-food-text mb-4 flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-food-light text-food-primary flex items-center justify-center text-base">
                <i className="fa-regular fa-newspaper" aria-hidden="true" />
              </span>
              {heading}
            </h2>

            {items.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-game-card p-10 text-center text-food-textMuted">
                {keyword ? "Không tìm thấy bài viết phù hợp." : showMagazine ? "Chưa có bài viết nào." : "Chưa có bài viết nào ở danh mục này."}
              </div>
            ) : (
              <>
                <div className="sm:hidden space-y-3">
                  {items.map((a) => (
                    <NewsCard key={a.id} article={a} variant="compact" />
                  ))}
                </div>
                <div className="hidden sm:grid sm:grid-cols-2 gap-5">
                  {items.map((a) => (
                    <NewsCard key={a.id} article={a} />
                  ))}
                </div>
              </>
            )}

            {showMagazine ? (
              totalCount > LATEST_ON_HOME + 1 && (
                <div className="mt-6 text-center">
                  <Link href="/tin-tuc?view=all" className="inline-flex items-center gap-2 bg-white border-2 border-food-primary text-food-primary hover:bg-food-primary hover:text-white transition rounded-full px-6 py-2.5 font-bold text-sm">
                    Xem tất cả {totalCount} bài viết <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                  </Link>
                </div>
              )
            ) : (
              <div className="mt-8">
                <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-[124px]">
            <BlogTrendingSidebar trending={trending} />
          </aside>
        </div>
      </main>

      <ScrollTopButton />
      <Footer />
    </div>
  );
}

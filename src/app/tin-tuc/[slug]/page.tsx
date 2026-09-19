import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ScrollTopButton from "@/components/home/ScrollTopButton";
import NewsCoverImage from "@/components/home/NewsCoverImage";
import PromotionCard from "@/components/home/PromotionCard";
import TableOfContents from "@/components/news/TableOfContents";
import SaveArticleButton from "@/components/news/SaveArticleButton";
import ShareButtons from "@/components/news/ShareButtons";
import ReadingProgressBar from "@/components/news/ReadingProgressBar";
import PlaceQuickFacts from "@/components/news/PlaceQuickFacts";
import PlaceActionBar from "@/components/news/PlaceActionBar";
import PlaceReviews from "@/components/news/PlaceReviews";
import NearbyPlaces from "@/components/news/NearbyPlaces";
import AuthorInfo from "@/components/news/AuthorInfo";
import RelatedServices from "@/components/news/RelatedServices";
import EndCTA from "@/components/news/EndCTA";
import { getSiteSettings } from "@/lib/settings";
import { toDisplayHtml } from "@/lib/sanitize-html";
import { prepareArticleContent, estimateReadingTime, splitBeforeHeading, injectVideoEmbeds, extractFaqItems } from "@/lib/article-content";

export const dynamic = "force-dynamic";

const CATEGORY_BADGE: Record<string, string> = {
  "Kinh nghiệm": "bg-brand-blue",
  "Địa điểm": "bg-amber-500",
  "Ẩm thực": "bg-orange-500",
  "Trải nghiệm": "bg-orange-500",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

async function getArticle(slug: string) {
  return prisma.news.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true } },
      place: { include: { reviews: { orderBy: { createdAt: "desc" }, take: 3 } } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || !article.published) return {};

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/tin-tuc/${article.slug}` },
    openGraph: {
      title,
      description,
      images: [article.coverImage],
      type: "article",
      publishedTime: article.createdAt.toISOString(),
    },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || !article.published) notFound();

  prisma.news.update({ where: { id: article.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const [related, settings, ratingAgg, nearbyPlaces, comboSale] = await Promise.all([
    prisma.news.findMany({
      where: { published: true, category: article.category, id: { not: article.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    getSiteSettings(),
    article.place ? prisma.review.aggregate({ where: { placeId: article.place.id }, _avg: { rating: true }, _count: true }) : null,
    article.place
      ? prisma.place.findMany({
          where: { category: article.place.category, id: { not: article.place.id } },
          select: { id: true, name: true, avatar: true, category: true },
          take: 4,
        })
      : Promise.resolve([]),
    prisma.sale.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const displayHtml = toDisplayHtml(article.content);
  const { html: contentWithIds, headings } = prepareArticleContent(displayHtml);
  const readingTime = estimateReadingTime(displayHtml);
  const { before: beforeRaw, after: afterRaw } = splitBeforeHeading(contentWithIds, 3);
  const before = injectVideoEmbeds(beforeRaw);
  const after = injectVideoEmbeds(afterRaw);
  const faqItems = extractFaqItems(contentWithIds);

  const jsonLdGraph: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.metaDescription || article.excerpt,
      image: [article.coverImage],
      datePublished: article.createdAt.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      author: { "@type": "Organization", name: article.author?.name || "Booking Phan Thiết" },
      publisher: { "@type": "Organization", name: "Booking Phan Thiết", logo: { "@type": "ImageObject", url: settings.logoUrl } },
    },
  ];
  if (faqItems.length > 0) {
    jsonLdGraph.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return (
    <>
      <ReadingProgressBar />
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }} />

      <div className="bg-white border-b border-slate-100">
        <div className="container-custom py-3 flex items-center gap-2 text-[13px] text-slate-400 overflow-x-auto scrollbar-none">
          <Link href="/" className="hover:text-brand-blue shrink-0">
            Trang chủ
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/tin-tuc" className="hover:text-brand-blue shrink-0">
            Blog
          </Link>
          <span aria-hidden="true">/</span>
          <span className="shrink-0">{article.category}</span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-600 font-medium truncate">{article.title}</span>
        </div>
      </div>

      <section className="container-custom py-7 lg:py-9">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
          <article className="min-w-0" id="noi-dung">
            <span
              className={`inline-block text-xs font-bold text-white px-3 py-1.5 rounded-full uppercase tracking-wide mb-3 ${
                CATEGORY_BADGE[article.category] ?? "bg-brand-blue"
              }`}
            >
              Khám phá Phan Thiết
            </span>

            <h1 className="font-display font-bold text-[28px] sm:text-[34px] leading-[1.2] text-slate-800 mb-3">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-400 mb-4">
              <span className="flex items-center gap-1.5">
                <i className="fa-regular fa-user" aria-hidden="true" /> {article.author?.name || "Booking Phan Thiết"}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fa-regular fa-calendar" aria-hidden="true" /> {formatDate(article.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fa-regular fa-eye" aria-hidden="true" /> {article.views.toLocaleString("vi-VN")} lượt xem
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fa-regular fa-clock" aria-hidden="true" /> {readingTime} phút đọc
              </span>
              <SaveArticleButton articleId={article.id} compact />
            </div>

            <p className="text-slate-600 text-[15px] sm:text-base leading-relaxed mb-6">{article.excerpt}</p>

            <div className="relative aspect-[2/1] rounded-3xl overflow-hidden shadow-lg mb-6">
              <NewsCoverImage src={article.coverImage} alt={article.title} fit="cover" />
            </div>

            {article.place && (
              <PlaceQuickFacts
                address={article.place.address}
                rating={ratingAgg?._avg.rating ?? null}
                reviewCount={ratingAgg?._count ?? 0}
                priceFromVnd={article.place.priceFromVnd}
                openingHours={article.place.openingHours}
                distanceFromCenterKm={article.place.distanceFromCenterKm}
              />
            )}

            {article.place && (
              <PlaceActionBar articleId={article.id} phone={article.place.phone} address={article.place.address} placeName={article.place.name} />
            )}

            <div
              className="article-content text-[15px] sm:text-base text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: before }}
            />

            {afterRaw && (
              <div className="my-10 rounded-3xl bg-brand-sky/60 border border-brand-blue/10 text-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shrink-0 text-brand-blue shadow-card">
                    <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
                  </span>
                  <p className="text-lg sm:text-xl font-bold leading-snug">Bạn muốn khám phá địa điểm này?</p>
                </div>
                <Link
                  href="/luu-tru"
                  className="shrink-0 bg-brand-blue text-white font-bold rounded-full px-6 py-3 hover:brightness-95 transition"
                >
                  Đặt tour ngay
                </Link>
              </div>
            )}

            {afterRaw && <div className="article-content text-[15px] sm:text-base text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: after }} />}

            <div className="mt-10 bg-white border border-slate-100 shadow-card rounded-2xl p-6 sm:p-8">
              <p className="font-display font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-flag-checkered text-brand-blue" aria-hidden="true" /> Tổng kết
              </p>
              <p className="text-slate-600 leading-relaxed">{article.excerpt}</p>
            </div>

            {article.place && <PlaceReviews reviews={article.place.reviews} placeName={article.place.name} />}

            {article.place?.mapEmbedUrl && (
              <div className="mt-10">
                <p className="font-display font-bold text-lg text-slate-800 mb-4">Bản đồ vị trí</p>
                <div className="rounded-2xl overflow-hidden shadow-card">
                  <iframe
                    src={article.place.mapEmbedUrl}
                    className="w-full border-0"
                    style={{ height: 450 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Bản đồ ${article.place.name}`}
                  />
                </div>
              </div>
            )}

            {comboSale && (
              <div className="mt-10">
                <p className="font-display font-bold text-lg text-slate-800 mb-4">Combo nổi bật</p>
                <PromotionCard sale={comboSale} isFeatured className="h-[280px]" />
              </div>
            )}

            <RelatedServices />

            <div id="chia-se" className="mt-10 flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-slate-100">
              <p className="font-bold text-slate-700">Chia sẻ bài viết</p>
              <ShareButtons path={`/tin-tuc/${article.slug}`} title={article.title} />
            </div>

            <EndCTA />

            {article.place && <NearbyPlaces places={nearbyPlaces} currentPlaceName={article.place.name} />}

            <AuthorInfo authorName={article.author?.name || "Booking Phan Thiết"} />
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24">
            {headings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
                <p className="font-display font-bold text-slate-800 mb-3">Mục lục bài viết</p>
                <TableOfContents headings={headings} />
              </div>
            )}

            <div className="rounded-2xl overflow-hidden bg-brand-blue text-white p-5">
              <p className="text-2xl mb-1" aria-hidden="true">
                🌊
              </p>
              <p className="font-display font-bold text-lg leading-snug mb-1.5">Khám phá Phan Thiết cùng chúng tôi!</p>
              <p className="text-sm text-white/80 mb-4">Đặt phòng, thuê xe, tour du lịch và nhiều dịch vụ tiện ích khác.</p>
              <Link
                href="/luu-tru"
                className="inline-flex items-center gap-2 bg-white text-brand-blue font-bold rounded-full px-4 py-2.5 text-sm hover:brightness-95 transition"
              >
                <i className="fa-solid fa-phone text-xs" aria-hidden="true" /> Liên hệ ngay
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
              <p className="font-display font-bold text-slate-800 mb-3">Thông tin nhanh</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-brand-blue w-4" aria-hidden="true" /> Phan Thiết, Bình Thuận
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-sun text-amber-500 w-4" aria-hidden="true" /> Nắng quanh năm
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-umbrella-beach text-brand-blue w-4" aria-hidden="true" /> Nhiều bãi biển đẹp
                </li>
              </ul>
            </div>

            {related.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
                <p className="font-display font-bold text-slate-800 mb-3">Bài viết liên quan</p>
                <div className="space-y-3">
                  {related.map((item) => (
                    <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="flex items-center gap-3 group">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <NewsCoverImage src={item.coverImage} alt={item.title} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 line-clamp-2 leading-snug group-hover:text-brand-blue transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(item.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-slate-50 py-12 lg:py-16">
          <div className="container-custom">
            <h2 className="font-display font-bold text-2xl text-slate-800 mb-6">Bài viết liên quan</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.slice(0, 3).map((item) => (
                <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="bg-white rounded-2xl shadow-card overflow-hidden hover-lift">
                  <div className="relative aspect-video bg-slate-100">
                    <NewsCoverImage src={item.coverImage} alt={item.title} />
                  </div>
                  <div className="p-4">
                    <p className="font-display font-bold text-slate-800 line-clamp-2 leading-snug mb-1.5">{item.title}</p>
                    <p className="text-sm text-slate-400 line-clamp-2">{item.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ScrollTopButton />
      <Footer />
    </>
  );
}

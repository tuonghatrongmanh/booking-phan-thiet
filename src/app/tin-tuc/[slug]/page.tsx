import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ogImages } from "@/lib/og-image";
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
import ArticleSectionTitle from "@/components/news/ArticleSectionTitle";
import { getSiteSettings } from "@/lib/settings";
import { toDisplayHtml } from "@/lib/sanitize-html";
import { prepareArticleContent, estimateReadingTime, splitBeforeHeading, injectVideoEmbeds, extractFaqItems } from "@/lib/article-content";

export const dynamic = "force-dynamic";

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
      images: ogImages(article.coverImage),
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

  const mapsUrl = article.place
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${article.place.name} ${article.place.address ?? ""}`.trim())}`
    : null;

  return (
    <>
      <ReadingProgressBar />
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }} />

      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 py-8">
        <nav className="text-[13px] text-food-textMuted font-semibold flex items-center gap-1.5 mb-5 flex-wrap">
          <Link href="/" className="hover:text-food-primary transition-colors">
            Trang chủ
          </Link>
          <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
          <Link href="/tin-tuc" className="hover:text-food-primary transition-colors">
            Blog
          </Link>
          <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
          <span>{article.category}</span>
          <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
          <span className="text-food-text">{article.title}</span>
        </nav>

        {/* Đầu bài kiểu tạp chí: chuyên mục, tiêu đề lớn, đoạn dẫn, tác giả + ngày; ảnh bìa rộng ngay bên dưới */}
        <header className="max-w-4xl">
          <Link
            href={`/tin-tuc?category=${encodeURIComponent(article.category)}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-food-primary hover:brightness-95 px-3 py-1.5 rounded-full uppercase tracking-wide"
          >
            <i className="fa-solid fa-newspaper" aria-hidden="true" /> {article.category}
          </Link>
          <h1 className="font-display font-extrabold text-food-text text-[28px] sm:text-[44px] leading-[1.15] mt-3 mb-4">{article.title}</h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-5">{article.excerpt}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pb-5 border-b border-slate-200">
            <span className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-full bg-food-light text-food-primary flex items-center justify-center font-display font-bold text-lg shrink-0">
                {(article.author?.name || "B").charAt(0).toUpperCase()}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold text-food-text">{article.author?.name || "Booking Phan Thiết"}</span>
                <span className="block text-xs text-food-textMuted">
                  {formatDate(article.createdAt)} · {readingTime} phút đọc · {article.views.toLocaleString("vi-VN")} lượt xem
                </span>
              </span>
            </span>
            <span className="ml-auto flex items-center gap-3 text-sm text-food-textMuted">
              <SaveArticleButton articleId={article.id} compact />
              <ShareButtons path={`/tin-tuc/${article.slug}`} title={article.title} />
            </span>
          </div>
        </header>

        <div className="group relative mt-6 aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-food-light shadow-game-card">
          <NewsCoverImage src={article.coverImage} alt={article.title} fit="cover" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 mt-8 items-start">
          <article className="min-w-0">
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

            <div id="noi-dung" className="scroll-mt-28 bg-white rounded-2xl shadow-game-card p-5 sm:p-8">
              <div className="article-content text-[15px] sm:text-base text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: before }} />

              {afterRaw && (
                <div className="my-8 rounded-2xl bg-food-light border border-brand-blue/10 text-food-text p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shrink-0 text-food-primary shadow-game-card">
                      <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
                    </span>
                    <p className="text-lg font-bold leading-snug">Bạn muốn khám phá địa điểm này?</p>
                  </div>
                  <Link href="/luu-tru" className="shrink-0 bg-food-primary text-white font-bold rounded-full px-6 py-3 hover:brightness-95 transition">
                    Đặt tour ngay
                  </Link>
                </div>
              )}

              {afterRaw && (
                <div className="article-content text-[15px] sm:text-base text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: after }} />
              )}

              <div className="mt-8 rounded-2xl bg-food-light p-5 sm:p-6">
                <p className="font-display font-bold text-lg text-food-text mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-flag-checkered text-food-primary" aria-hidden="true" /> Tổng kết
                </p>
                <p className="text-slate-600 leading-relaxed">{article.excerpt}</p>
              </div>
            </div>

            {article.place && article.place.reviews.length > 0 && (
              <section id="danh-gia" className="scroll-mt-40 mt-6 bg-white rounded-2xl shadow-game-card p-5 sm:p-6">
                <PlaceReviews reviews={article.place.reviews} placeName={article.place.name} />
              </section>
            )}

            {article.place?.mapEmbedUrl && (
              <section id="ban-do" className="scroll-mt-40 mt-6 bg-white rounded-2xl shadow-game-card p-5 sm:p-6">
                <ArticleSectionTitle icon="fa-solid fa-location-dot">Bản đồ vị trí</ArticleSectionTitle>
                <div className="rounded-xl overflow-hidden">
                  <iframe
                    src={article.place.mapEmbedUrl}
                    className="w-full border-0 h-[320px] sm:h-[420px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Bản đồ ${article.place.name}`}
                  />
                </div>
              </section>
            )}

            {comboSale && (
              <section id="uu-dai" className="scroll-mt-40 mt-6">
                <ArticleSectionTitle icon="fa-solid fa-gift">Combo nổi bật</ArticleSectionTitle>
                <PromotionCard sale={comboSale} isFeatured className="h-[280px]" />
              </section>
            )}

            <section id="dich-vu" className="scroll-mt-40 mt-6 bg-white rounded-2xl shadow-game-card p-5 sm:p-6">
              <RelatedServices />
            </section>

            <div id="chia-se" className="mt-6 bg-white rounded-2xl shadow-game-card p-5 sm:p-6 flex items-center justify-between flex-wrap gap-4">
              <p className="font-display font-bold text-food-text flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-food-light text-food-primary flex items-center justify-center text-sm">
                  <i className="fa-solid fa-share-nodes" aria-hidden="true" />
                </span>
                Chia sẻ bài viết
              </p>
              <ShareButtons path={`/tin-tuc/${article.slug}`} title={article.title} />
            </div>

            <EndCTA />

            {article.place && nearbyPlaces.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl shadow-game-card p-5 sm:p-6">
                <NearbyPlaces places={nearbyPlaces} currentPlaceName={article.place.name} />
              </div>
            )}

            <AuthorInfo authorName={article.author?.name || "Booking Phan Thiết"} />
          </article>

          <aside className="min-w-0 space-y-4 lg:self-stretch">

            {article.place && mapsUrl && (
              <div className="bg-white rounded-2xl shadow-game-card p-5">
                <p className="font-bold text-sm text-food-text mb-1 flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-food-primary" aria-hidden="true" /> {article.place.name}
                </p>
                {article.place.address && <p className="text-sm text-food-textMuted mb-3">{article.place.address}</p>}
                {article.place.mapEmbedUrl && (
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-food-light mb-3">
                    <iframe
                      src={article.place.mapEmbedUrl}
                      className="absolute inset-0 w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Bản đồ ${article.place.name}`}
                    />
                  </div>
                )}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-10 border-2 border-food-primary text-food-primary hover:bg-food-primary hover:text-white transition rounded-full text-sm font-bold"
                >
                  <i className="fa-solid fa-diamond-turn-right" aria-hidden="true" /> Xem đường đi
                </a>
                {article.place.phone && (
                  <a
                    href={`tel:${article.place.phone}`}
                    className="block text-center mt-2 bg-food-primary hover:brightness-95 transition text-white text-sm font-bold rounded-full py-2.5"
                  >
                    <i className="fa-solid fa-phone mr-1.5" aria-hidden="true" /> {article.place.phone}
                  </a>
                )}
              </div>
            )}

            <div className="space-y-4 lg:sticky lg:top-[124px] lg:max-h-[calc(100vh-148px)] lg:overflow-y-auto scrollbar-none">
              {headings.length > 0 && (
                <div className="bg-white rounded-2xl shadow-game-card p-5">
                  <p className="font-bold text-sm text-food-text mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-list-ul text-food-primary" aria-hidden="true" /> Mục lục bài viết
                  </p>
                  <TableOfContents headings={headings} />
                </div>
              )}

              <div className="rounded-2xl overflow-hidden bg-food-navy text-white p-5">
                <p className="font-display font-bold text-lg leading-snug mb-1.5">Khám phá Phan Thiết cùng chúng tôi!</p>
                <p className="text-sm text-white/80 mb-4">Đặt phòng, thuê xe, tour du lịch và nhiều dịch vụ tiện ích khác.</p>
                <Link
                  href="/luu-tru"
                  className="inline-flex items-center gap-2 bg-white text-food-navy font-bold rounded-full px-4 py-2.5 text-sm hover:brightness-95 transition"
                >
                  Xem lưu trú <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                </Link>
              </div>

              {related.length > 0 && (
                <div className="bg-white rounded-2xl shadow-game-card p-5">
                  <p className="font-bold text-sm text-food-text mb-3 flex items-center gap-2">
                    <i className="fa-regular fa-newspaper text-food-primary" aria-hidden="true" /> Bài viết cùng chuyên mục
                  </p>
                  <div className="space-y-3">
                    {related.slice(0, 3).map((item) => (
                      <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="flex items-center gap-3 group">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-food-light shrink-0">
                          <NewsCoverImage src={item.coverImage} alt={item.title} fit="cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-food-text line-clamp-2 leading-snug group-hover:text-food-primary transition-colors">{item.title}</p>
                          <p className="text-xs text-food-textMuted mt-0.5">{formatDate(item.createdAt)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section id="bai-lien-quan" className="scroll-mt-40 bg-food-bg py-12 lg:py-14">
          <div className="max-w-[1240px] mx-auto px-6 sm:px-8">
            <h2 className="font-display font-extrabold text-2xl text-food-text mb-6">Bài viết liên quan</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.slice(0, 3).map((item) => (
                <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="group bg-white rounded-2xl shadow-game-card overflow-hidden hover-lift">
                  <div className="relative aspect-video bg-food-light">
                    <NewsCoverImage src={item.coverImage} alt={item.title} fit="cover" />
                  </div>
                  <div className="p-4">
                    <p className="font-display font-bold text-food-text line-clamp-2 leading-snug mb-1.5">{item.title}</p>
                    <p className="text-sm text-food-textMuted line-clamp-2">{item.excerpt}</p>
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

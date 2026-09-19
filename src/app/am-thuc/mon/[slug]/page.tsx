import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toDisplayHtml } from "@/lib/sanitize-html";
import { getActor } from "@/lib/auth-actor";
import { formatFoodPrice, mapsSearchUrl } from "@/lib/food-categories";
import { getAmThucBannerSettings } from "@/lib/am-thuc-banner-settings";
import { SITE_URL, absoluteUrl } from "@/lib/site-url";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import FoodGallery from "@/components/food/FoodGallery";
import FoodSaveShareButtons from "@/components/food/FoodSaveShareButtons";
import FoodDetailTabs from "@/components/food/FoodDetailTabs";

export const dynamic = "force-dynamic";

const RATING_LABELS = ["Rất tệ", "Tệ", "Bình thường", "Tốt", "Rất tuyệt vời"];

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const food = await prisma.food.findUnique({ where: { slug } });
  if (!food) return {};
  const title = food.metaTitle || `${food.name} - ${food.restaurant} | Ẩm Thực Phan Thiết`;
  const description = food.metaDescription || food.description.slice(0, 160);
  const url = `${SITE_URL}/am-thuc/mon/${food.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", locale: "vi_VN", ...(food.image ? { images: [absoluteUrl(food.image)!] } : {}) },
  };
}

export default async function FoodDetailPage({ params }: Params) {
  const { slug } = await params;
  const [food, actor, bannerSettings] = await Promise.all([
    prisma.food.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, avatar: true } }, images: true },
        },
      },
    }),
    getActor(),
    getAmThucBannerSettings(),
  ]);
  if (!food || !food.active) notFound();

  const contentHtml = toDisplayHtml(food.content || "");
  const mapsUrl = food.googleMapsUrl || mapsSearchUrl(food.restaurant);

  const galleryItems = [
    ...(food.image ? [{ type: "image" as const, url: food.image }] : []),
    ...food.images.map((img) => ({ type: "image" as const, url: img.url })),
    ...(food.videoUrl ? [{ type: "video" as const, videoId: food.videoUrl, caption: food.videoCaption }] : []),
  ];

  const hasRealReviews = food.reviews.length > 0;
  const ratingAverage = hasRealReviews
    ? food.reviews.reduce((sum, r) => sum + r.rating, 0) / food.reviews.length
    : food.rating;
  const ratingTotal = hasRealReviews ? food.reviews.length : food.reviewCount;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = food.reviews.filter((r) => r.rating === star).length;
    return {
      label: RATING_LABELS[star - 1],
      pct: hasRealReviews ? Math.round((count / food.reviews.length) * 100) : 0,
    };
  });


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: food.restaurant,
    image: absoluteUrl(food.image) ? [absoluteUrl(food.image)] : undefined,
    url: `${SITE_URL}/am-thuc/mon/${food.slug}`,
    telephone: food.phone || undefined,
    address: { "@type": "PostalAddress", addressLocality: "Phan Thiết", addressRegion: "Bình Thuận", addressCountry: "VN" },
    ...(ratingTotal > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: ratingAverage.toFixed(1), reviewCount: ratingTotal } }
      : {}),
    hasMenuItem: {
      "@type": "MenuItem",
      name: food.name,
      description: food.description,
      offers: { "@type": "Offer", price: food.priceFrom, priceCurrency: "VND" },
    },
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 py-8">
        <nav className="text-[13px] text-food-textMuted font-semibold flex items-center gap-1.5 mb-5 flex-wrap">
          <Link href="/" className="hover:text-food-primary transition-colors">
            Trang chủ
          </Link>
          <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
          <Link href="/am-thuc" className="hover:text-food-primary transition-colors">
            Ẩm thực
          </Link>
          <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
          <span className="hover:text-food-primary transition-colors">{food.restaurant}</span>
          <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
          {food.name}
        </nav>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div>
            <FoodGallery items={galleryItems} badge={food.badge || undefined} />

            <div className="mt-8">
              <FoodDetailTabs
                foodId={food.id}
                description={food.description}
                contentHtml={contentHtml}
                verified={food.verified}
                verifiedStampImage={bannerSettings.verifiedStampImage}
                reviews={food.reviews.map((r) => ({
                  id: r.id,
                  rating: r.rating,
                  content: r.content,
                  createdAt: r.createdAt.toISOString(),
                  user: r.user,
                  images: r.images,
                }))}
                ratingAverage={ratingAverage}
                ratingTotal={ratingTotal}
                ratingBreakdown={ratingBreakdown}
                isLoggedIn={actor?.type === "user"}
                videoId={food.videoUrl}
                videoCaption={food.videoCaption}
                images={[...(food.image ? [{ url: food.image }] : []), ...food.images]}
                mapEmbedUrl={food.mapEmbedUrl}
                googleMapsUrl={mapsUrl}
                openingHours={food.openingHours}
                phone={food.phone}
                websiteUrl={food.websiteUrl}
                fanpageUrl={food.fanpageUrl}
                restaurant={food.restaurant}
              />
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[90px]">
            <div className="bg-white rounded-2xl shadow-game-card p-5">
              <h1 className="font-display font-extrabold text-food-text text-xl leading-snug mb-2">{food.name}</h1>

              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="flex items-center gap-1 text-sm">
                  <i className="fa-solid fa-star text-food-rating" aria-hidden="true" />
                  <span className="font-bold text-food-text">{ratingAverage.toFixed(1)}</span>
                  <span className="text-food-textMuted">({ratingTotal} đánh giá)</span>
                </span>
                {food.verified && (
                  <span className="text-[11px] font-bold text-brand-green bg-brand-greenBg px-2 py-1 rounded-full flex items-center gap-1">
                    <i className="fa-solid fa-shield-check" aria-hidden="true" /> Đã kiểm chứng
                  </span>
                )}
              </div>

              <p className="text-sm text-food-textMuted flex items-start gap-1.5 mb-3">
                <i className="fa-solid fa-location-dot text-food-primary mt-0.5" aria-hidden="true" />
                <span>{food.restaurant}</span>
              </p>

              <p className="mb-4">
                <span className="text-xs text-food-textMuted">Giá từ </span>
                <span className="font-display font-extrabold text-food-primary text-xl">{formatFoodPrice(food.priceFrom)}</span>
                <span className="text-xs text-food-textMuted"> / {food.unit}</span>
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: "fa-solid fa-fish", label: "Hải sản tươi sống" },
                  { icon: "fa-solid fa-kitchen-set", label: "Chế biến sạch" },
                  { icon: "fa-solid fa-star", label: "Phục vụ tận tâm" },
                ].map((b) => (
                  <div key={b.label} className="text-center">
                    <span className="w-9 h-9 mx-auto rounded-full bg-food-light text-food-primary flex items-center justify-center mb-1">
                      <i className={b.icon} aria-hidden="true" />
                    </span>
                    <p className="text-[10px] text-food-textMuted leading-tight">{b.label}</p>
                  </div>
                ))}
              </div>

              <FoodSaveShareButtons foodId={food.id} name={food.name} />
            </div>

            <div className="bg-white rounded-2xl shadow-game-card p-5">
              <p className="font-bold text-sm text-food-text mb-3 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-food-primary" aria-hidden="true" /> Địa chỉ &amp; Bản đồ
              </p>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-food-light mb-3">
                {food.mapEmbedUrl ? (
                  <iframe src={food.mapEmbedUrl} className="absolute inset-0 w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-food-primary/30 text-3xl">
                    <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
                  </div>
                )}
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-10 border-2 border-food-primary text-food-primary hover:bg-food-primary hover:text-white transition rounded-full text-sm font-bold"
              >
                <i className="fa-solid fa-diamond-turn-right" aria-hidden="true" /> Xem đường đi
              </a>
            </div>

            {food.openingHours && (
              <div className="bg-white rounded-2xl shadow-game-card p-5">
                <p className="font-bold text-sm text-food-text mb-2 flex items-center gap-2">
                  <i className="fa-regular fa-clock text-food-primary" aria-hidden="true" /> Giờ mở cửa
                </p>
                <p className="text-sm text-food-textGray whitespace-pre-line">{food.openingHours}</p>
              </div>
            )}

            {(food.phone || food.websiteUrl || food.fanpageUrl) && (
              <div className="bg-white rounded-2xl shadow-game-card p-5 space-y-2">
                <p className="font-bold text-sm text-food-text mb-1 flex items-center gap-2">
                  <i className="fa-solid fa-circle-info text-food-primary" aria-hidden="true" /> Thông tin thêm
                </p>
                {food.phone && (
                  <p className="text-sm text-food-textGray flex items-center gap-2">
                    <i className="fa-solid fa-phone text-food-textMuted" aria-hidden="true" /> {food.phone}
                  </p>
                )}
                {food.websiteUrl && (
                  <p className="text-sm text-food-textGray flex items-center gap-2 truncate">
                    <i className="fa-solid fa-globe text-food-textMuted" aria-hidden="true" />
                    <a href={food.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-food-primary truncate">
                      {food.websiteUrl}
                    </a>
                  </p>
                )}
                {food.fanpageUrl && (
                  <p className="text-sm text-food-textGray flex items-center gap-2 truncate">
                    <i className="fa-brands fa-facebook text-food-textMuted" aria-hidden="true" />
                    <a href={food.fanpageUrl} target="_blank" rel="noopener noreferrer" className="hover:text-food-primary truncate">
                      {food.fanpageUrl}
                    </a>
                  </p>
                )}
                {food.phone && (
                  <a
                    href={`tel:${food.phone}`}
                    className="block text-center mt-2 bg-food-primary hover:brightness-95 transition text-white text-sm font-bold rounded-full py-2.5"
                  >
                    Liên hệ nhà hàng
                  </a>
                )}
              </div>
            )}

            {bannerSettings.crossPromoTitle && (
              <Link
                href="/am-thuc"
                className="block relative overflow-hidden rounded-2xl p-5 text-white bg-cover bg-center min-h-[140px]"
                style={{
                  backgroundImage: bannerSettings.crossPromoImage ? `url('${bannerSettings.crossPromoImage}')` : undefined,
                  backgroundColor: bannerSettings.crossPromoImage ? undefined : "var(--color-food-navy)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="relative">
                  <p className="font-display font-bold text-base leading-snug mb-3">{bannerSettings.crossPromoTitle}</p>
                  <span className="inline-flex items-center gap-1.5 bg-white text-food-navy text-sm font-bold rounded-full px-4 py-2">
                    {bannerSettings.crossPromoButtonText} <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            )}
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
}

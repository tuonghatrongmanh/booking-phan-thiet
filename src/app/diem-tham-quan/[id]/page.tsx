import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toDisplayHtml } from "@/lib/sanitize-html";
import { getActor } from "@/lib/auth-actor";
import { getLuuTruPageSettings } from "@/lib/luu-tru-settings";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import PlaceGallery from "@/components/places-detail/PlaceGallery";
import PlaceSaveShareButtons from "@/components/places-detail/PlaceSaveShareButtons";
import PlaceDetailTabs from "@/components/places-detail/PlaceDetailTabs";
import TranslatedField from "@/components/i18n/TranslatedField";
import { SITE_URL, absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const RATING_LABELS = ["Rất tệ", "Tệ", "Bình thường", "Tốt", "Rất tuyệt vời"];

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const place = await prisma.place.findUnique({ where: { id } });
  if (!place || place.category !== "ATTRACTION" || place.hidden) return {};
  return {
    title: `${place.name} | Điểm tham quan Phan Thiết`,
    description: place.description ?? undefined,
  };
}

export default async function AttractionDetailPage({ params }: Params) {
  const { id } = await params;
  const [place, actor, bannerSettings] = await Promise.all([
    prisma.place.findUnique({
      where: { id },
      include: {
        images: true,
        reviews: { orderBy: { createdAt: "desc" } },
        placeReviews: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, avatar: true } }, images: true },
        },
      },
    }),
    getActor(),
    getLuuTruPageSettings(),
  ]);
  if (!place || place.category !== "ATTRACTION" || place.hidden) notFound();

  const contentHtml = toDisplayHtml("");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address ?? "Phan Thiết"}`)}`;

  const galleryItems = [
    ...(place.avatar ? [{ type: "image" as const, url: place.avatar }] : []),
    ...place.images.map((img) => ({ type: "image" as const, url: img.url })),
    ...(place.videoUrl ? [{ type: "video" as const, videoId: place.videoUrl, caption: place.videoCaption }] : []),
  ];

  const hasRealReviews = place.placeReviews.length > 0;
  const adminReviewCount = place.reviews.length;
  const adminReviewAvg =
    adminReviewCount > 0 ? place.reviews.reduce((s, r) => s + r.rating, 0) / adminReviewCount : 0;

  const ratingAverage = hasRealReviews
    ? place.placeReviews.reduce((sum, r) => sum + r.rating, 0) / place.placeReviews.length
    : adminReviewAvg;
  const ratingTotal = hasRealReviews ? place.placeReviews.length : adminReviewCount;
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = place.placeReviews.filter((r) => r.rating === star).length;
    return {
      label: RATING_LABELS[star - 1],
      pct: hasRealReviews ? Math.round((count / place.placeReviews.length) * 100) : 0,
    };
  });


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: place.name,
    description: place.description || undefined,
    image: absoluteUrl(place.avatar) ? [absoluteUrl(place.avatar)] : undefined,
    url: `${SITE_URL}/diem-tham-quan/${place.id}`,
    telephone: place.phone || undefined,
    address: place.address ? { "@type": "PostalAddress", streetAddress: place.address, addressLocality: "Phan Thiết", addressRegion: "Bình Thuận", addressCountry: "VN" } : undefined,
    ...(ratingTotal > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: ratingAverage.toFixed(1), reviewCount: ratingTotal } }
      : {}),
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
          <Link href="/diem-tham-quan" className="hover:text-food-primary transition-colors">
            Trải nghiệm
          </Link>
          <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
          <TranslatedField as="span" model="Place" recordId={place.id} field="name" className="text-food-text">{place.name}</TranslatedField>
        </nav>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div>
            <PlaceGallery items={galleryItems} />

            <div className="mt-8">
              <PlaceDetailTabs
                placeId={place.id}
                description={place.description ?? ""}
                contentHtml={contentHtml}
                verified={place.status === "TRUSTED"}
                verifiedStampImage={bannerSettings.verifiedStampImage}
                reviews={place.placeReviews.map((r) => ({
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
                videoId={place.videoUrl}
                videoCaption={place.videoCaption}
                images={[...(place.avatar ? [{ url: place.avatar }] : []), ...place.images]}
                mapEmbedUrl={place.mapEmbedUrl}
                googleMapsUrl={mapsUrl}
                openingHours={place.openingHours}
                phone={place.phone}
                fanpageUrl={place.fanpageUrl}
                address={place.address}
              />
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[90px]">
            <div className="bg-white rounded-2xl shadow-game-card p-5">
              <h1 className="font-display font-extrabold text-food-text text-xl leading-snug mb-2"><TranslatedField model="Place" recordId={place.id} field="name">{place.name}</TranslatedField></h1>

              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="flex items-center gap-1 text-sm">
                  <i className="fa-solid fa-star text-food-rating" aria-hidden="true" />
                  <span className="font-bold text-food-text">{ratingAverage.toFixed(1)}</span>
                  <span className="text-food-textMuted">({ratingTotal} đánh giá)</span>
                </span>
                {place.status === "TRUSTED" && (
                  <span className="text-[11px] font-bold text-brand-green bg-brand-greenBg px-2 py-1 rounded-full flex items-center gap-1">
                    <i className="fa-solid fa-shield-check" aria-hidden="true" /> Đã kiểm chứng
                  </span>
                )}
              </div>

              {place.address && (
                <p className="text-sm text-food-textMuted flex items-start gap-1.5 mb-3">
                  <i className="fa-solid fa-location-dot text-food-primary mt-0.5" aria-hidden="true" />
                  <span>{place.address}</span>
                </p>
              )}

              {place.priceFromVnd != null && (
                <p className="mb-4">
                  <span className="text-xs text-food-textMuted">Giá vé từ </span>
                  <span className="font-display font-extrabold text-food-primary text-xl">{place.priceFromVnd.toLocaleString("vi-VN")}đ</span>
                </p>
              )}

              <PlaceSaveShareButtons placeId={place.id} name={place.name} />
            </div>

            <div className="bg-white rounded-2xl shadow-game-card p-5">
              <p className="font-bold text-sm text-food-text mb-3 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-food-primary" aria-hidden="true" /> Địa chỉ &amp; Bản đồ
              </p>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-food-light mb-3">
                {place.mapEmbedUrl ? (
                  <iframe src={place.mapEmbedUrl} className="absolute inset-0 w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
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

            {place.openingHours && (
              <div className="bg-white rounded-2xl shadow-game-card p-5">
                <p className="font-bold text-sm text-food-text mb-2 flex items-center gap-2">
                  <i className="fa-regular fa-clock text-food-primary" aria-hidden="true" /> Giờ mở cửa
                </p>
                <p className="text-sm text-food-textGray whitespace-pre-line">{place.openingHours}</p>
              </div>
            )}

            {(place.phone || place.fanpageUrl) && (
              <div className="bg-white rounded-2xl shadow-game-card p-5 space-y-2">
                <p className="font-bold text-sm text-food-text mb-1 flex items-center gap-2">
                  <i className="fa-solid fa-circle-info text-food-primary" aria-hidden="true" /> Thông tin thêm
                </p>
                {place.phone && (
                  <p className="text-sm text-food-textGray flex items-center gap-2">
                    <i className="fa-solid fa-phone text-food-textMuted" aria-hidden="true" /> {place.phone}
                  </p>
                )}
                {place.fanpageUrl && (
                  <p className="text-sm text-food-textGray flex items-center gap-2 truncate">
                    <i className="fa-brands fa-facebook text-food-textMuted" aria-hidden="true" />
                    <a href={place.fanpageUrl} target="_blank" rel="noopener noreferrer" className="hover:text-food-primary truncate">
                      {place.fanpageUrl}
                    </a>
                  </p>
                )}
                {place.phone && (
                  <a
                    href={`tel:${place.phone}`}
                    className="block text-center mt-2 bg-food-primary hover:brightness-95 transition text-white text-sm font-bold rounded-full py-2.5"
                  >
                    Liên hệ
                  </a>
                )}
              </div>
            )}

            {bannerSettings.crossPromoTitle && (
              <Link
                href="/diem-tham-quan"
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

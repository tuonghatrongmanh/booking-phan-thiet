import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { avgOf, PLACE_STATUS_INFO, AVAILABILITY_INFO, availabilityLabel } from "@/lib/places";
import { STAY_TYPE_INFO } from "@/lib/place-amenities";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ScrollTopButton from "@/components/home/ScrollTopButton";
import StayGallery from "@/components/places/StayGallery";
import StayBookingCard from "@/components/places/StayBookingCard";
import StayMobileBookingBar from "@/components/places/StayMobileBookingBar";
import StayPromoContactRow from "@/components/places/StayPromoContactRow";
import StayAmenityIconRow from "@/components/places/StayAmenityIconRow";
import StaySubNav from "@/components/places/StaySubNav";
import StayQuickInfoBoxes from "@/components/places/StayQuickInfoBoxes";
import StayOverviewDescription from "@/components/places/StayOverviewDescription";
import TranslatedField from "@/components/i18n/TranslatedField";
import StayAmenitiesPreview from "@/components/places/StayAmenitiesPreview";
import StayOverviewSidebar from "@/components/places/StayOverviewSidebar";
import StayRoomCard from "@/components/places/StayRoomCard";
import StayReviewsSection from "@/components/places/StayReviewsSection";
import StayFAQ from "@/components/places/StayFAQ";
import RelatedStays from "@/components/places/RelatedStays";
import ExplorePhanThiet from "@/components/places/ExplorePhanThiet";
import Reveal from "@/components/home/Reveal";
import T from "@/lib/i18n/T";
import { SITE_URL, absoluteUrl } from "@/lib/site-url";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#102F4F] mb-4">{children}</h2>;
}

function Section({ children }: { children: React.ReactNode }) {
  return <section className="bg-white border border-[#E5EDF5] rounded-2xl shadow-[0_4px_20px_rgba(15,76,129,0.06)] p-5 sm:p-7">{children}</section>;
}

export default async function StayDetailView({ placeId }: { placeId: string }) {
  const place = await prisma.place.findUnique({
    where: { id: placeId },
    include: {
      images: { orderBy: { id: "asc" } },
      reviews: { orderBy: { createdAt: "desc" }, include: { images: true } },
    },
  });

  if (!place || place.category !== "HOMESTAY" || place.hidden) notFound();

  void prisma.place.update({ where: { id: place.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const rating = avgOf(place.reviews.map((r) => r.rating));
  const statusInfo = PLACE_STATUS_INFO[place.status];
  const isTrusted = place.status === "TRUSTED";
  const amenities = Array.isArray(place.amenities) ? (place.amenities as string[]) : [];
  const stayTypeInfo = place.stayType ? STAY_TYPE_INFO[place.stayType] : null;
  const nearBeach = place.distanceToBeachM != null && place.distanceToBeachM <= 500;
  const ctaHref = place.zaloUrl || (place.phone ? `tel:${place.phone}` : undefined);

  const relatedRaw = await prisma.place.findMany({
    where: { category: "HOMESTAY", id: { not: place.id } },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1, orderBy: { id: "asc" } }, reviews: { select: { rating: true } } },
  });
  const related = relatedRaw.map((p) => ({
    id: p.id,
    name: p.name,
    address: p.address,
    coverImage: p.images[0]?.url ?? null,
    avgRating: avgOf(p.reviews.map((r) => r.rating)),
    priceFromVnd: p.priceFromVnd,
  }));


  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: place.name,
    image: absoluteUrl(place.avatar) ? [absoluteUrl(place.avatar)] : undefined,
    url: `${SITE_URL}/luu-tru/${place.id}`,
    telephone: place.phone || undefined,
    address: place.address ? { "@type": "PostalAddress", streetAddress: place.address, addressLocality: "Phan Thiết", addressRegion: "Bình Thuận", addressCountry: "VN" } : undefined,
    priceRange: place.priceFromVnd ? `Từ ${place.priceFromVnd.toLocaleString("vi-VN")}đ` : undefined,
    ...(place.reviews.length > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.toFixed(1), reviewCount: place.reviews.length } }
      : {}),
  };

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-[#F6F9FC]">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[13px] py-4 overflow-x-auto scrollbar-none whitespace-nowrap">
            <Link href="/" className="text-[#6B83A0] hover:text-[#168BE0] transition">
              Trang chủ
            </Link>
            <i className="fa-solid fa-chevron-right text-[10px] text-[#6B83A0]" aria-hidden="true" />
            <Link href="/luu-tru" className="text-[#6B83A0] hover:text-[#168BE0] transition">
              Lưu trú
            </Link>
            <i className="fa-solid fa-chevron-right text-[10px] text-[#6B83A0]" aria-hidden="true" />
            <span className="text-[#153A5B] font-semibold">{place.name}</span>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        <div className="grid lg:grid-cols-[1fr_390px] gap-7 items-start">
          <div className="space-y-5">
            <StayGallery
              images={place.images.map((img) => ({ id: img.id, url: img.url, caption: img.caption }))}
              name={place.name}
              isTrusted={isTrusted}
            />

            <div>
              {!isTrusted && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold text-white ${statusInfo.bg} px-3 py-1.5 rounded-full shadow mb-3`}
                >
                  <i className={statusInfo.icon} aria-hidden="true" /> {statusInfo.label}
                </span>
              )}

              {place.availabilityStatus && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold text-white ${AVAILABILITY_INFO[place.availabilityStatus].bg} px-3 py-1.5 rounded-full shadow mb-3 ml-2`}
                >
                  <i className={AVAILABILITY_INFO[place.availabilityStatus].icon} aria-hidden="true" /> {availabilityLabel(place.availabilityStatus, "room")}
                </span>
              )}

              <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#102F4F] leading-[1.2] max-w-[700px] flex items-center gap-2">
                <TranslatedField model="Place" recordId={place.id} field="name">
                  {place.name}
                </TranslatedField>
                {isTrusted && <i className="fa-solid fa-circle-check text-[#1685D7] text-xl shrink-0" aria-hidden="true" />}
              </h1>

              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="text-[#FFB91D]">
                  <i className="fa-solid fa-star" aria-hidden="true" />
                </span>
                <span className="font-extrabold text-[#102F4F]">{rating.toFixed(1)}</span>
                {rating >= 4.5 && <span className="text-sm font-bold text-[#16A05D]">Xuất sắc</span>}
                <span className="text-sm text-[#7187A2]">({place.reviews.length} đánh giá)</span>
              </div>

              {place.address && (
                <p className="flex flex-wrap items-center gap-2 text-[15px] text-[#5F7894] mt-2.5">
                  <i className="fa-solid fa-map-pin text-[#EF4444]" aria-hidden="true" /> {place.address}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1688D8] hover:underline font-semibold"
                  >
                    Xem trên bản đồ
                  </a>
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-[#E6EEF5]">
                <StayAmenityIconRow amenities={amenities} />
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-[110px]">
            <StayBookingCard priceFromVnd={place.priceFromVnd} phone={place.phone} zaloUrl={place.zaloUrl} />
          </div>
        </div>

        <StayPromoContactRow phone={place.phone} zaloUrl={place.zaloUrl} />

        <StaySubNav reviewCount={place.reviews.length} />

        <section id="tong-quan" className="scroll-mt-[140px] grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-6">
            <Section>
              <SectionTitle><T id="stay.detail.overview">Về chỗ nghỉ này</T></SectionTitle>
              <StayOverviewDescription placeId={place.id} description={place.description} />
              <div className="mt-5">
                <StayQuickInfoBoxes petFriendly={place.petFriendly} />
              </div>
            </Section>

            <Section>
              <SectionTitle><T id="stay.detail.amenities">Tiện nghi nổi bật</T></SectionTitle>
              <StayAmenitiesPreview amenities={amenities} />
            </Section>
          </div>

          <StayOverviewSidebar distanceToBeachM={place.distanceToBeachM} mapEmbedUrl={place.mapEmbedUrl} />
        </section>

        <section id="phong-gia" className="scroll-mt-[140px] space-y-6">
          <Section>
            <SectionTitle><T id="stay.detail.rooms">Phòng & Giá</T></SectionTitle>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <StayRoomCard
                name={place.name}
                image={place.images[0]?.url ?? null}
                amenities={amenities}
                priceFromVnd={place.priceFromVnd}
                ctaHref={ctaHref}
                popular
                metaLabel={stayTypeInfo?.label}
                metaIcon={stayTypeInfo?.icon}
              />
            </div>
          </Section>

          <div id="danh-gia" className="scroll-mt-[140px]">
            <Section>
              <SectionTitle><T id="stay.detail.reviews">Đánh giá từ khách hàng</T></SectionTitle>
              <StayReviewsSection reviews={place.reviews} avgRating={rating} />
            </Section>
          </div>
        </section>

        <Reveal>
          <Section>
            <SectionTitle><T id="stay.detail.faq">Câu hỏi thường gặp</T></SectionTitle>
            <StayFAQ nearBeach={nearBeach} distanceToBeachM={place.distanceToBeachM} petFriendly={place.petFriendly} />
          </Section>
        </Reveal>

        {related.length > 0 && (
          <Reveal>
            <section>
              <SectionTitle><T id="stay.detail.related">Có thể bạn cũng thích</T></SectionTitle>
              <RelatedStays items={related} />
            </section>
          </Reveal>
        )}

        <Reveal>
          <section>
            <div className="text-center max-w-lg mx-auto mb-6">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#102F4F]"><T id="stay.detail.explore">Khám phá Phan Thiết</T></h2>
              <p className="text-sm text-[#8297AC] mt-2">Những trải nghiệm và địa điểm không thể bỏ lỡ</p>
            </div>
            <ExplorePhanThiet />
          </section>
        </Reveal>
      </main>

      <Footer />
      <ScrollTopButton />
      <StayMobileBookingBar priceFromVnd={place.priceFromVnd} phone={place.phone} zaloUrl={place.zaloUrl} />
      <div className="lg:hidden h-[68px]" aria-hidden="true" />
    </div>
  );
}

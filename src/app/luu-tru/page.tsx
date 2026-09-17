import Link from "next/link";
import Image from "next/image";
import SafeImage from "@/components/places/SafeImage";
import { prisma } from "@/lib/prisma";
import { avgOf } from "@/lib/places";
import { getLuuTruPageSettings } from "@/lib/luu-tru-settings";
import AttractionCard from "@/components/places-detail/AttractionCard";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import PlaceListCard, { type PlaceListItem } from "@/components/places/PlaceListCard";
import SortSelect from "@/components/places/SortSelect";
import StayFilterSidebar from "@/components/places/StayFilterSidebar";
import MobileFilterDrawer from "@/components/places/MobileFilterDrawer";
import ScrollToResults from "@/components/places/ScrollToResults";
import Pagination from "@/components/places/Pagination";
import type { FilterListItem } from "@/components/places/ExpandableFilterList";
import Reveal from "@/components/home/Reveal";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 6;

type Search = {
  q?: string;
  stayType?: string;
  amenity?: string;
  beach?: string;
  pet?: string;
  area?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  page?: string;
};

function buildHref(current: Search, overrides: Partial<Search>, clearAll?: boolean) {
  const merged: Search = clearAll ? { sort: current.sort, ...overrides } : { ...current, ...overrides };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/luu-tru?${qs}` : "/luu-tru";
}

const CATEGORY_ICONS: Record<string, string> = {
  ALL: "fa-solid fa-grip",
  BEACH: "fa-solid fa-water",
  POOL: "fa-solid fa-person-swimming",
  PET: "fa-solid fa-paw",
  FAMILY: "fa-solid fa-people-roof",
};

export default async function LuuTruPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const { q, stayType, amenity, beach, pet, area, sort = "popular", minPrice, maxPrice, minRating } = sp;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const hrefFor = (overrides: Partial<Search>) => buildHref(sp, { ...overrides, page: undefined });
  const clearHref = buildHref(sp, {}, true);

  const [heroBanner, stayTypes, stayAreas, stayAmenities, luuTruSettings] = await Promise.all([
    prisma.pageBanner.findFirst({ where: { slot: "luu-tru-hero", active: true } }),
    prisma.stayTypeSetting.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.stayArea.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.stayAmenity.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getLuuTruPageSettings(),
  ]);
  const heroImage = heroBanner?.image ?? "/images/danhmuc-homestay.png";

  const attractions = await prisma.place.findMany({
    where: { category: "ATTRACTION" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { reviews: { select: { rating: true } }, placeReviews: { select: { rating: true } } },
  });
  const attractionCards = attractions.map((a) => {
    const hasRealReviews = a.placeReviews.length > 0;
    const ratingAverage = hasRealReviews
      ? a.placeReviews.reduce((s, r) => s + r.rating, 0) / a.placeReviews.length
      : a.reviews.length > 0
        ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length
        : 0;
    const ratingTotal = hasRealReviews ? a.placeReviews.length : a.reviews.length;
    return { id: a.id, name: a.name, description: a.description, avatar: a.avatar, address: a.address, ratingAverage, ratingTotal };
  });
  const amenityIconMap: Record<string, string> = Object.fromEntries(stayAmenities.map((a) => [a.label, a.icon]));

  const allHomestays = await prisma.place.findMany({
    where: { category: "HOMESTAY" },
    select: { stayType: true, amenities: true, address: true, distanceToBeachM: true, petFriendly: true },
  });

  const stayTypeCounts: Record<string, number> = {};
  const amenityCounts = new Map<string, number>();
  for (const p of allHomestays) {
    if (p.stayType) stayTypeCounts[p.stayType] = (stayTypeCounts[p.stayType] ?? 0) + 1;
    const list = Array.isArray(p.amenities) ? (p.amenities as string[]) : [];
    for (const a of list) amenityCounts.set(a, (amenityCounts.get(a) ?? 0) + 1);
  }
  const amenityItems: FilterListItem[] = [...amenityCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      key: label,
      label,
      count,
      href: hrefFor({ amenity: amenity === label ? undefined : label }),
      active: amenity === label,
    }));

  const areaItems = stayAreas.map(({ label: a }) => ({
    label: a,
    count: allHomestays.filter((p) => p.address?.includes(a)).length,
    href: hrefFor({ area: area === a ? undefined : a }),
    active: area === a,
  }));

  const places = await prisma.place.findMany({
    where: {
      category: "HOMESTAY",
      hidden: false,
      ...(q
        ? { OR: [{ name: { contains: q } }, { description: { contains: q } }, { address: { contains: q } }] }
        : {}),
      ...(stayType ? { stayType: stayType as never } : {}),
      ...(pet ? { petFriendly: true } : {}),
      ...(beach ? { distanceToBeachM: { lte: 500 } } : {}),
      ...(area ? { address: { contains: area } } : {}),
      ...(minPrice ? { priceFromVnd: { gte: Number(minPrice) } } : {}),
      ...(maxPrice ? { priceFromVnd: { lte: Number(maxPrice) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { id: "asc" } },
      reviews: { select: { rating: true } },
      _count: { select: { reviews: true } },
    },
  });

  let items: PlaceListItem[] = places
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      address: p.address,
      status: p.status,
      coverImage: p.images[0]?.url ?? null,
      imageCount: p.images.length,
      avgRating: avgOf(p.reviews.map((r) => r.rating)),
      reviewCount: p._count.reviews,
      priceFromVnd: p.priceFromVnd,
      distanceToBeachM: p.distanceToBeachM,
      amenities: Array.isArray(p.amenities) ? (p.amenities as string[]) : [],
      stayType: p.stayType,
      petFriendly: p.petFriendly,
      featured: p.featuredRank != null,
      availabilityStatus: p.availabilityStatus,
    }))
    .filter((p) => (amenity ? p.amenities.includes(amenity) : true))
    .filter((p) => (minRating ? p.avgRating >= Number(minRating) : true));

  if (sort === "price-asc") {
    items = items.slice().sort((a, b) => (a.priceFromVnd ?? Infinity) - (b.priceFromVnd ?? Infinity));
  } else if (sort === "price-desc") {
    items = items.slice().sort((a, b) => (b.priceFromVnd ?? -1) - (a.priceFromVnd ?? -1));
  } else if (sort === "rating") {
    items = items.slice().sort((a, b) => b.avgRating - a.avgRating);
  }

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageHref = (p: number) => buildHref(sp, { page: p === 1 ? undefined : String(p) });

  const topAmenities = amenityItems.slice(0, 4);

  const noFilters = !q && !stayType && !amenity && !beach && !pet && !area && !minPrice && !maxPrice && !minRating;

  return (
    <div className="min-h-screen bg-slate-50">
      <ScrollToResults />
      <Header />

      <div className="relative h-[300px] sm:h-[230px] overflow-hidden">
        <Image src={heroImage} alt="Lưu trú Phan Thiết" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/35 to-transparent" />
        <div className="absolute inset-0 bg-brand-sky/10" />

        <div className="relative h-full container-custom flex flex-col justify-start pt-6">
          <nav className="text-outline-white text-xs text-slate-600 mb-2 flex items-center gap-1.5 font-semibold">
            <Link href="/" className="hover:text-brand-blue transition">
              Trang chủ
            </Link>
            <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
            <span className="text-slate-700">Lưu trú</span>
          </nav>

          <div className="max-w-[500px]">
            <h1 className="text-outline-white font-display font-extrabold text-2xl sm:text-[34px] leading-tight">
              <span className="text-navy-DEFAULT">Lưu trú</span> <span className="text-brand-blue">Phan Thiết</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="container-custom">
        <form
          action="/luu-tru#ket-qua"
          className="relative z-10 -mt-[150px] sm:-mt-[70px] bg-white rounded-[20px] shadow-[0_20px_50px_-18px_rgba(2,60,120,0.28)] p-2"
        >
          <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-row lg:gap-0 lg:divide-x divide-slate-100">
            <div className="col-span-2 lg:flex-[35] min-w-0 px-4 py-3 flex items-center gap-3">
              <i className="fa-solid fa-magnifying-glass text-slate-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <label className="block text-[11px] text-slate-400 font-semibold">Bạn muốn tìm gì?</label>
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Tên homestay, villa, địa điểm, tiện ích..."
                  className="w-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="lg:flex-[15] min-w-0 px-4 py-3 flex items-center gap-2.5 border-t lg:border-t-0 border-slate-100">
              <i className="fa-regular fa-calendar text-slate-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <label className="block text-[11px] text-slate-400 font-semibold">Nhận phòng</label>
                <input type="date" name="checkin" className="w-full text-sm text-slate-600 focus:outline-none" />
              </div>
            </div>

            <div className="lg:flex-[15] min-w-0 px-4 py-3 flex items-center gap-2.5 border-t lg:border-t-0 border-slate-100">
              <i className="fa-regular fa-calendar text-slate-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <label className="block text-[11px] text-slate-400 font-semibold">Trả phòng</label>
                <input type="date" name="checkout" className="w-full text-sm text-slate-600 focus:outline-none" />
              </div>
            </div>

            <div className="lg:flex-[15] min-w-0 px-4 py-3 flex items-center gap-2.5">
              <i className="fa-solid fa-user-group text-slate-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <label className="block text-[11px] text-slate-400 font-semibold">Số khách</label>
                <select name="guests" defaultValue="2-1" className="w-full text-sm text-slate-600 focus:outline-none bg-transparent">
                  <option value="1-1">1 khách, 1 phòng</option>
                  <option value="2-1">2 khách, 1 phòng</option>
                  <option value="3-1">3 khách, 1 phòng</option>
                  <option value="4-2">4 khách, 2 phòng</option>
                </select>
              </div>
            </div>

            <div className="lg:flex-[20] min-w-0 p-1.5">
              <button
                type="submit"
                className="w-full h-full bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-[16px] px-4 py-3 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Tìm kiếm
              </button>
            </div>
          </div>
        </form>
      </div>

      <Reveal><section className="container-custom pt-6 pb-2">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
          <Link
            href={clearHref}
            className={`shrink-0 w-[84px] flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-[11px] font-semibold transition ${
              noFilters ? "border-brand-blue bg-brand-sky text-brand-blue" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            <i className={`${CATEGORY_ICONS.ALL} text-lg`} aria-hidden="true" />
            Tất cả
          </Link>

          {stayTypes.map((info) => {
            const key = info.id;
            const active = stayType === key;
            return (
              <Link
                key={key}
                href={hrefFor({ stayType: active ? undefined : key })}
                className={`shrink-0 w-[84px] flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-[11px] font-semibold transition ${
                  active ? "border-brand-blue bg-brand-sky text-brand-blue" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <i className={`${info.icon} text-lg`} aria-hidden="true" />
                {info.label}
              </Link>
            );
          })}

          <Link
            href={hrefFor({ beach: beach ? undefined : "1" })}
            className={`shrink-0 w-[84px] flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-[11px] font-semibold transition ${
              beach ? "border-brand-blue bg-brand-sky text-brand-blue" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            <i className={`${CATEGORY_ICONS.BEACH} text-lg`} aria-hidden="true" />
            Gần biển
          </Link>

          <Link
            href={hrefFor({ amenity: amenity === "Hồ bơi" ? undefined : "Hồ bơi" })}
            className={`shrink-0 w-[84px] flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-[11px] font-semibold transition ${
              amenity === "Hồ bơi" ? "border-brand-blue bg-brand-sky text-brand-blue" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            <i className={`${CATEGORY_ICONS.POOL} text-lg`} aria-hidden="true" />
            Có hồ bơi
          </Link>

          <Link
            href={hrefFor({ pet: pet ? undefined : "1" })}
            className={`shrink-0 w-[84px] flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-[11px] font-semibold transition ${
              pet ? "border-brand-blue bg-brand-sky text-brand-blue" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            <i className={`${CATEGORY_ICONS.PET} text-lg`} aria-hidden="true" />
            Pet-friendly
          </Link>

          <span className="shrink-0 w-[84px] flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border border-slate-200 bg-white text-slate-400 text-[11px] font-semibold">
            <i className={`${CATEGORY_ICONS.FAMILY} text-lg`} aria-hidden="true" />
            Phù hợp gia đình
          </span>

          <span className="shrink-0 w-[84px] flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border border-dashed border-slate-200 bg-white text-slate-400 text-[11px] font-semibold">
            <i className="fa-solid fa-ellipsis text-lg" aria-hidden="true" />
            Xem thêm
          </span>
        </div>
      </section></Reveal>

      <Reveal><section id="ket-qua" className="container-custom py-6 scroll-mt-20">
        <div className="grid lg:grid-cols-[minmax(0,20%)_minmax(0,55%)_minmax(0,25%)] gap-6 items-start">
          <MobileFilterDrawer>
            <StayFilterSidebar
              clearHref={clearHref}
              applyHref={buildHref(sp, {})}
              hrefFor={hrefFor}
              stayTypes={stayTypes}
              stayType={stayType}
              stayTypeCounts={stayTypeCounts}
              amenityItems={amenityItems}
              minRating={minRating}
              areaItems={areaItems}
            />
          </MobileFilterDrawer>

          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Tìm thấy <span className="font-bold text-brand-blue">{totalItems}</span> chỗ lưu trú tại Phan Thiết
              </p>
              <SortSelect />
            </div>

            <div className="space-y-4">
              {pageItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-400">
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    <SafeImage src="/images/khong-tim-thay-phong.png" alt="" fill className="object-contain" fallbackClassName="text-slate-200" />
                  </div>
                  Không tìm thấy chỗ lưu trú phù hợp. Thử bỏ bớt bộ lọc xem sao nhé.
                </div>
              ) : (
                pageItems.map((place) => <PlaceListCard key={place.id} place={place} basePath="/luu-tru" />)
              )}
            </div>

            <div className="pt-6">
              <Pagination currentPage={currentPage} totalPages={totalPages} buildHref={pageHref} />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-2xl shadow-card p-4">
              <div className="relative h-32 rounded-xl bg-brand-sky overflow-hidden mb-3">
                {luuTruSettings.mapEmbedUrl ? (
                  <iframe
                    src={luuTruSettings.mapEmbedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center text-brand-blue/30">
                      <i className="fa-solid fa-map-location-dot text-4xl" aria-hidden="true" />
                    </div>
                    <i className="fa-solid fa-location-dot text-brand-red text-lg absolute drop-shadow" style={{ top: "18%", left: "30%" }} aria-hidden="true" />
                    <i className="fa-solid fa-location-dot text-brand-red text-lg absolute drop-shadow" style={{ top: "45%", left: "55%" }} aria-hidden="true" />
                    <i className="fa-solid fa-location-dot text-brand-red text-lg absolute drop-shadow" style={{ top: "65%", left: "25%" }} aria-hidden="true" />
                    <i className="fa-solid fa-location-dot text-brand-red text-lg absolute drop-shadow" style={{ top: "30%", left: "78%" }} aria-hidden="true" />
                  </>
                )}
              </div>
              <h3 className="font-display font-bold text-sm text-slate-800 mb-2.5">Khám phá theo khu vực</h3>
              <div className="grid grid-cols-2 gap-2">
                {stayAreas.map(({ label: a }) => (
                  <Link
                    key={a}
                    href={hrefFor({ area: area === a ? undefined : a })}
                    className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-2.5 py-2 border transition ${
                      area === a ? "border-brand-blue bg-brand-sky text-brand-blue" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <i className="fa-solid fa-location-dot text-brand-red" aria-hidden="true" /> {a}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href={hrefFor({ sort: "price-asc" })}
              className="block relative overflow-hidden bg-navy-DEFAULT rounded-2xl p-5 text-white"
            >
              <i className="fa-solid fa-gift absolute -right-2 -bottom-2 text-white/10 text-8xl" aria-hidden="true" />
              <i className="fa-solid fa-gift text-2xl text-brand-gold mb-3" aria-hidden="true" />
              <p className="font-display font-extrabold text-xl leading-tight">{luuTruSettings.promoTitle}</p>
              <p className="text-white/80 text-sm mt-1">{luuTruSettings.promoSubtitle}</p>
              <span className="inline-block mt-4 bg-white text-navy-DEFAULT text-sm font-bold rounded-full px-4 py-2">
                {luuTruSettings.promoButtonText}
              </span>
            </Link>

            {topAmenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-4">
                <h3 className="font-display font-bold text-sm text-slate-800 mb-3">Tiện ích được yêu thích</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {topAmenities.map((a) => (
                    <Link
                      key={a.key}
                      href={a.href}
                      className="flex flex-col items-center gap-1.5 text-center border border-slate-200 hover:border-brand-blue rounded-xl px-2 py-3 transition"
                    >
                      <i className={`${amenityIconMap[a.label] ?? "fa-solid fa-circle-check"} text-brand-blue text-lg`} aria-hidden="true" />
                      <span className="text-xs font-semibold text-slate-600">{a.label}</span>
                      <span className="text-[11px] text-slate-400">{a.count} chỗ nghỉ</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section></Reveal>

      {attractionCards.length > 0 && (
      <Reveal><section id="kham-pha-phan-thiet" className="bg-brand-sky/40 py-12 scroll-mt-24">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-800">Trải nghiệm tuyệt vời tại Phan Thiết</h2>
            <p className="text-slate-500 text-sm mt-2">Khám phá những hoạt động và địa điểm hấp dẫn không thể bỏ lỡ</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {attractionCards.map((c) => (
              <AttractionCard key={c.id} attraction={c} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/diem-tham-quan"
              className="inline-flex items-center gap-2 bg-brand-blue hover:brightness-95 transition text-white text-sm font-bold rounded-full px-6 py-2.5"
            >
              Xem thêm địa điểm <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section></Reveal>
      )}

      <Footer />
    </div>
  );
}

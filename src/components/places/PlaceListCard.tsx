import Link from "next/link";
import Image from "next/image";
import { PLACE_STATUS_INFO, AVAILABILITY_INFO, availabilityLabel, type PlaceStatusKey, type AvailabilityStatusKey } from "@/lib/places";
import { AMENITY_ICONS, STAY_TYPE_INFO, formatPriceVnd } from "@/lib/place-amenities";

export type PlaceListItem = {
  id: string;
  name: string;
  avatar: string | null;
  address: string | null;
  status: PlaceStatusKey;
  coverImage: string | null;
  imageCount: number;
  avgRating: number;
  reviewCount: number;
  priceFromVnd: number | null;
  distanceToBeachM: number | null;
  amenities: string[];
  stayType: string | null;
  petFriendly: boolean;
  featured: boolean;
  availabilityStatus: AvailabilityStatusKey | null;
};

export default function PlaceListCard({ place, basePath }: { place: PlaceListItem; basePath: string }) {
  const stayTypeInfo = place.stayType ? STAY_TYPE_INFO[place.stayType] : null;
  const nearBeach = place.distanceToBeachM != null && place.distanceToBeachM <= 500;
  const isTrusted = place.status === "TRUSTED";
  const statusInfo = PLACE_STATUS_INFO[place.status];

  const tags = [stayTypeInfo?.label, nearBeach ? "Gần biển" : null, place.petFriendly ? "Pet-friendly" : null].filter(
    (t): t is string => Boolean(t)
  );

  return (
    <Link
      href={`${basePath}/${place.id}`}
      className="flex flex-col sm:flex-row gap-4 bg-white rounded-2xl shadow-card overflow-hidden hover-lift animate-fade-up p-3"
    >
      <div className="relative w-full sm:w-[32%] h-48 sm:h-auto shrink-0 rounded-xl overflow-hidden bg-slate-100">
        {place.coverImage && (
          <Image src={place.coverImage} alt={place.name} fill sizes="(min-width: 640px) 320px, 100vw" className="object-cover" />
        )}
        {!isTrusted ? (
          <span
            className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-white ${statusInfo.bg} px-2.5 py-1 rounded-full shadow`}
          >
            <i className={statusInfo.icon} aria-hidden="true" /> {statusInfo.label}
          </span>
        ) : (
          place.featured && (
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-white bg-brand-blue px-2.5 py-1 rounded-full shadow">
              <i className="fa-solid fa-star" aria-hidden="true" /> Ưu tiên
            </span>
          )
        )}
        {place.imageCount > 0 && (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-white bg-black/55 px-2 py-1 rounded-full">
            <i className="fa-solid fa-images" aria-hidden="true" /> {place.imageCount}
          </span>
        )}
        {place.availabilityStatus && (
          <span
            className={`absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-white px-2.5 py-1 rounded-full shadow ${AVAILABILITY_INFO[place.availabilityStatus].bg}`}
          >
            <i className={AVAILABILITY_INFO[place.availabilityStatus].icon} aria-hidden="true" /> {availabilityLabel(place.availabilityStatus, "room")}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 py-1 pr-2 flex flex-col">
        <p className="font-display font-bold text-lg text-slate-800 flex items-center gap-1.5">
          {place.name}
          {isTrusted && <i className="fa-solid fa-circle-check text-brand-blue text-sm" aria-hidden="true" />}
        </p>
        {place.address && (
          <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1">
            <i className="fa-solid fa-location-dot" aria-hidden="true" /> {place.address}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-sm mt-1.5">
          <span className="text-brand-gold flex">
            <i className="fa-solid fa-star" aria-hidden="true" />
          </span>
          <span className="font-bold text-slate-700">{place.avgRating.toFixed(1)}</span>
          <span className="text-slate-400">({place.reviewCount} đánh giá)</span>
          {place.distanceToBeachM != null && <span className="text-slate-400"> · {place.distanceToBeachM}m đến biển</span>}
        </div>

        {place.amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2.5">
            {place.amenities.slice(0, 4).map((a) => (
              <span key={a} className="flex items-center gap-1.5">
                <i className={AMENITY_ICONS[a] ?? "fa-solid fa-circle-check"} aria-hidden="true" /> {a}
              </span>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((t) => (
              <span key={t} className="text-[11px] font-semibold text-brand-blue bg-brand-sky px-2 py-1 rounded-md">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-2 mt-auto pt-3">
          {place.priceFromVnd != null ? (
            <p className="text-slate-800">
              <span className="text-xs text-slate-400">từ </span>
              <span className="font-display font-extrabold text-lg text-brand-blue">{formatPriceVnd(place.priceFromVnd)}</span>
              <span className="text-xs text-slate-400"> / đêm</span>
            </p>
          ) : (
            <span />
          )}
          <span className="bg-brand-blue hover:brightness-95 transition text-white text-sm font-bold rounded-xl px-4 py-2">
            Xem chi tiết
          </span>
        </div>
      </div>
    </Link>
  );
}

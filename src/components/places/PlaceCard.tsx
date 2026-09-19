import Link from "next/link";
import Image from "next/image";
import { PLACE_STATUS_INFO, type PlaceStatusKey } from "@/lib/places";

export type PlaceCardData = {
  id: string;
  name: string;
  avatar: string | null;
  address: string | null;
  status: PlaceStatusKey;
  coverImage: string | null;
  avgRating: number;
  reviewCount: number;
};

export default function PlaceCard({ place, basePath }: { place: PlaceCardData; basePath: string }) {
  const statusInfo = PLACE_STATUS_INFO[place.status];

  return (
    <Link
      href={`${basePath}/${place.id}`}
      className="block bg-white rounded-2xl shadow-card overflow-hidden hover-lift animate-fade-up"
    >
      <div className="relative h-36 bg-gradient-to-br from-brand-blueMid to-brand-blueLight">
        {place.coverImage && <Image src={place.coverImage} alt={place.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />}
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-white ${statusInfo.bg} px-2.5 py-1 rounded-full shadow`}
        >
          <i className={statusInfo.icon} aria-hidden="true" /> {statusInfo.label}
        </span>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 ring-4 ring-white shadow-lg z-10 bg-brand-sky -mt-7">
            {place.avatar ? (
              <Image src={place.avatar} alt={place.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-blue">
                <i className="fa-solid fa-shop" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="min-w-0 pt-2">
            <p className="font-bold text-[15px] text-slate-800 truncate">{place.name}</p>
            {place.address && (
              <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                <i className="fa-solid fa-location-dot" aria-hidden="true" /> {place.address}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <span className="text-brand-gold flex">
            {Array.from({ length: 5 }).map((_, s) => (
              <i key={s} className="fa-solid fa-star" style={{ opacity: s < Math.round(place.avgRating) ? 1 : 0.3 }} aria-hidden="true" />
            ))}
          </span>
          <span className="font-bold text-slate-700">{place.avgRating.toFixed(1)}</span>
          <span className="text-slate-400">({place.reviewCount} đánh giá)</span>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import SafeImage from "@/components/places/SafeImage";
import { formatPriceVnd } from "@/lib/place-amenities";

export type RelatedStay = {
  id: string;
  name: string;
  address: string | null;
  coverImage: string | null;
  avgRating: number;
  priceFromVnd: number | null;
};

export default function RelatedStays({ items }: { items: RelatedStay[] }) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((p) => (
        <Link
          key={p.id}
          href={`/luu-tru/${p.id}`}
          className="group bg-white border border-[#E6EEF5] rounded-2xl overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(16,60,100,0.10)] transition"
        >
          <div className="relative aspect-16/10 bg-[#EDF3F8] overflow-hidden">
            {p.coverImage ? (
              <SafeImage
                src={p.coverImage}
                alt={p.name}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                <i className="fa-regular fa-image text-2xl" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="p-3.5">
            <p className="font-bold text-[#102F4F] text-sm truncate">{p.name}</p>
            {p.address && (
              <p className="text-xs text-[#8298AE] mt-1 flex items-center gap-1 truncate">
                <i className="fa-solid fa-location-dot" aria-hidden="true" /> {p.address}
              </p>
            )}
            <div className="flex items-center gap-1 text-xs mt-1.5">
              <i className="fa-solid fa-star text-[#FFB91D]" aria-hidden="true" />
              <span className="font-bold text-[#334D66]">{p.avgRating.toFixed(1)}</span>
            </div>
            {p.priceFromVnd != null && (
              <p className="mt-1.5">
                <span className="text-[11px] text-[#8298AE]">Từ </span>
                <span className="font-extrabold text-[#1678C8]">{formatPriceVnd(p.priceFromVnd)}</span>
                <span className="text-[11px] text-[#8298AE]"> / đêm</span>
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

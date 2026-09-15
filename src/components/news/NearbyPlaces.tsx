import Link from "next/link";
import Image from "next/image";

type NearbyItem = { id: string; name: string; avatar: string | null; category: string };

const CATEGORY_LINK: Record<string, string> = {
  HOMESTAY: "/luu-tru",
  ATTRACTION: "/luu-tru",
  RESTAURANT: "/am-thuc",
  CAR_RENTAL: "/luu-tru",
  SALE: "/luu-tru",
};

export default function NearbyPlaces({ places, currentPlaceName }: { places: NearbyItem[]; currentPlaceName: string }) {
  if (places.length === 0) return null;

  return (
    <div className="mt-10">
      <p className="font-display font-bold text-lg text-slate-800 mb-4">Địa điểm gần {currentPlaceName}</p>
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1">
        {places.map((p) => (
          <Link
            key={p.id}
            href={CATEGORY_LINK[p.category] ?? "/luu-tru"}
            className="shrink-0 w-40 bg-white border border-slate-100 shadow-card rounded-2xl overflow-hidden hover-lift"
          >
            <div className="relative w-full h-24 bg-slate-100">
              {p.avatar ? (
                <Image src={p.avatar} alt={p.name} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-brand-blue/25 text-2xl">
                  <i className="fa-solid fa-location-dot" aria-hidden="true" />
                </div>
              )}
            </div>
            <p className="text-sm font-bold text-slate-700 p-3 line-clamp-2 leading-snug">{p.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

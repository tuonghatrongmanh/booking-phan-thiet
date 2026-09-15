import Link from "next/link";
import Image from "next/image";

export type AttractionCardData = {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  address: string | null;
  ratingAverage: number;
  ratingTotal: number;
};

export default function AttractionCard({ attraction }: { attraction: AttractionCardData }) {
  return (
    <Link
      href={`/diem-tham-quan/${attraction.id}`}
      className="group bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-4/3 bg-gradient-to-br from-brand-sky to-sky-100">
        {attraction.avatar ? (
          <Image src={attraction.avatar} alt={attraction.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-brand-blue/30 text-3xl">
            <i className="fa-solid fa-mountain-sun" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-brand-blue transition-colors">{attraction.name}</p>
        {attraction.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{attraction.description}</p>}
        {attraction.ratingTotal > 0 && (
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
            <i className="fa-solid fa-star text-brand-gold" aria-hidden="true" />
            <span className="font-bold">{attraction.ratingAverage.toFixed(1)}</span>
            <span className="text-slate-400">({attraction.ratingTotal})</span>
          </p>
        )}
      </div>
    </Link>
  );
}

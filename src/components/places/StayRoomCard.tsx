import SafeImage from "@/components/places/SafeImage";
import { formatPriceVnd } from "@/lib/place-amenities";

export default function StayRoomCard({
  name,
  image,
  amenities,
  priceFromVnd,
  ctaHref,
  popular,
  metaLabel,
  metaIcon,
}: {
  name: string;
  image: string | null;
  amenities: string[];
  priceFromVnd: number | null;
  ctaHref?: string;
  popular?: boolean;
  metaLabel?: string;
  metaIcon?: string;
}) {
  return (
    <div className="bg-white border border-[#E6EEF5] rounded-2xl overflow-hidden flex flex-col">
      <div className="relative aspect-4/3 shrink-0 bg-[#EDF3F8]">
        {image ? (
          <SafeImage src={image} alt={name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
            <i className="fa-regular fa-image text-2xl" aria-hidden="true" />
          </div>
        )}
        {popular && (
          <span className="absolute top-3 left-3 bg-[#16A05D] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
            Phổ biến nhất
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[17px] font-extrabold text-[#102F4F]">{name}</p>

        {metaLabel && (
          <p className="flex items-center gap-1.5 text-xs text-[#6E8CA8] mt-1.5">
            <i className={metaIcon ?? "fa-solid fa-house"} aria-hidden="true" /> {metaLabel}
          </p>
        )}

        {amenities.length > 0 && (
          <ul className="space-y-1 mt-3">
            {amenities.slice(0, 5).map((a) => (
              <li key={a} className="flex items-center gap-1.5 text-[13px] text-[#334D66]">
                <i className="fa-solid fa-check text-[#16A05D]" aria-hidden="true" /> {a}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-end justify-between gap-2 mt-auto pt-4">
          {priceFromVnd != null ? (
            <p>
              <span className="text-xs text-[#8298AE]">Từ </span>
              <br />
              <span className="text-[20px] font-extrabold text-brand-blue leading-none">{formatPriceVnd(priceFromVnd)}</span>
              <span className="text-xs text-[#8298AE]"> /đêm</span>
            </p>
          ) : (
            <span />
          )}
          <a
            href={ctaHref}
            aria-disabled={!ctaHref}
            className={`text-sm font-bold text-white rounded-[10px] px-4 py-2.5 transition shrink-0 ${
              ctaHref ? "bg-brand-blue hover:brightness-95" : "bg-slate-300 pointer-events-none"
            }`}
          >
            Chọn phòng
          </a>
        </div>
      </div>
    </div>
  );
}

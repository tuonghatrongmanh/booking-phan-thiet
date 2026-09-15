import { AMENITY_ICONS, AMENITY_SUBTITLE } from "@/lib/place-amenities";

export default function StayAmenitiesPreview({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) {
    return <p className="text-sm text-[#8297AC]">Chưa cập nhật thông tin tiện nghi.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {amenities.map((a) => (
        <div key={a} className="flex items-center gap-3 border border-[#E6EEF5] rounded-xl px-3.5 py-3">
          <span className="w-10 h-10 rounded-lg bg-[#EEF8FF] text-[#168BE0] flex items-center justify-center shrink-0">
            <i className={AMENITY_ICONS[a] ?? "fa-solid fa-circle-check"} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#102F4F] truncate">{a}</p>
            {AMENITY_SUBTITLE[a] && <p className="text-xs text-[#8298AE] truncate">{AMENITY_SUBTITLE[a]}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

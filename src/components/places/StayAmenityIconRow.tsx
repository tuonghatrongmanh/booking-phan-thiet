import { AMENITY_ICONS } from "@/lib/place-amenities";

export default function StayAmenityIconRow({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;

  return (
    <div className="flex items-center gap-6 sm:gap-7 overflow-x-auto scrollbar-none py-1">
      {amenities.map((a) => (
        <div key={a} className="shrink-0 flex flex-col items-center gap-1.5 text-center w-[76px]">
          <i className={`${AMENITY_ICONS[a] ?? "fa-solid fa-circle-check"} text-[#5F7894] text-lg`} aria-hidden="true" />
          <span className="text-[12px] text-[#47647F] leading-tight">{a}</span>
        </div>
      ))}
    </div>
  );
}

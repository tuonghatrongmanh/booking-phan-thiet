import { formatFoodPrice } from "@/lib/food-categories";

// Thanh "gioi thieu dia diem noi bat" ngay duoi tieu de bai viet - CHI hien khi bai
// viet duoc gan voi 1 Place cu the (xem NewsForm "Dia diem lien quan"). Dung lai du
// lieu THAT cua Place (khong bia so lieu) - muc nao Place khong co du lieu se an muc do.
export default function PlaceQuickFacts({
  address,
  rating,
  reviewCount,
  priceFromVnd,
  openingHours,
  distanceFromCenterKm,
}: {
  address: string | null;
  rating: number | null;
  reviewCount: number;
  priceFromVnd: number | null;
  openingHours: string | null;
  distanceFromCenterKm: number | null;
}) {
  const items = [
    address && { icon: "fa-solid fa-location-dot text-brand-blue", label: address },
    rating != null && {
      icon: "fa-solid fa-star text-amber-500",
      label: `${rating.toFixed(1)}/5${reviewCount > 0 ? ` (${reviewCount} đánh giá)` : ""}`,
    },
    priceFromVnd != null && { icon: "fa-solid fa-tag text-brand-green", label: `Từ ${formatFoodPrice(priceFromVnd)}` },
    openingHours && { icon: "fa-solid fa-clock text-brand-blue", label: openingHours },
    distanceFromCenterKm != null && {
      icon: "fa-solid fa-car text-brand-blue",
      label: `${distanceFromCenterKm}km từ trung tâm Phan Thiết`,
    },
  ].filter(Boolean) as { icon: string; label: string }[];

  if (items.length === 0) return null;

  return (
    <div className="bg-white shadow-game-card rounded-2xl p-4 sm:p-5 mb-4">
      <div className="flex flex-wrap gap-x-6 gap-y-2.5">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-semibold text-food-text">
            <i className={item.icon} aria-hidden="true" /> {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

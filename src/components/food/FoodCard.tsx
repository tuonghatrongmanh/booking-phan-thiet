import Link from "next/link";
import type { Food, FoodCategory } from "@prisma/client";
import { BADGE_COLOR, categoryIcon, categoryLabel, formatFoodPrice } from "@/lib/food-categories";

export default function FoodCard({
  food,
  categories,
  isFavorite,
  onToggleFavorite,
}: {
  food: Food;
  categories: FoodCategory[];
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const href = `/am-thuc/mon/${food.slug}`;

  return (
    <article className="group bg-white border border-[#E8EEF5] rounded-3xl overflow-hidden shadow-[0_4px_15px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] hover:-translate-y-1 hover:border-brand-blueMid transition-all duration-250">
      <div className="relative">
        <Link href={href} aria-label={`Xem chi tiết ${food.name}`} className="relative block w-full aspect-4/3 overflow-hidden bg-food-light">
          {food.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={food.image}
              alt={food.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-food-primary/25 text-5xl">
              <i className={categoryIcon(categories, food.categoryId)} aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          <span className={`absolute top-2.5 left-2.5 text-[11px] font-bold text-white ${BADGE_COLOR[food.badge || ""] ?? "bg-food-primary"} px-2.5 py-1 rounded-full shadow-sm`}>
            {food.badge || categoryLabel(categories, food.categoryId)}
          </span>

          {food.verified && (
            <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold text-white bg-brand-green/90 px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <i className="fa-solid fa-shield-check" aria-hidden="true" /> Đã kiểm duyệt
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => onToggleFavorite(food.id)}
          aria-label={isFavorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          aria-pressed={isFavorite}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 hover:scale-110 active:scale-95 transition-transform flex items-center justify-center shadow"
        >
          <i
            className={isFavorite ? "fa-solid fa-heart text-food-danger" : "fa-regular fa-heart text-food-textMuted"}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="p-3.5">
        <Link href={href} className="text-left w-full block">
          <p className="font-bold text-[15px] text-food-text leading-snug line-clamp-2 group-hover:text-food-primary transition-colors">{food.name}</p>
        </Link>

        <p className="text-xs text-food-textMuted mt-1.5 flex items-center gap-1 w-fit">
          <i className="fa-solid fa-location-dot" aria-hidden="true" /> {food.restaurant}
        </p>

        <div className="flex items-center gap-1 text-xs mt-2">
          <i className="fa-solid fa-star text-food-rating" aria-hidden="true" />
          <span className="font-bold text-food-text">{food.rating.toFixed(1)}</span>
          <span className="text-food-textMuted">({food.reviewCount} đánh giá)</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-[#EAF0F6]">
          <p>
            <span className="text-[11px] text-food-textMuted">Từ </span>
            <span className="font-display font-extrabold text-food-primary text-[16px]">{formatFoodPrice(food.priceFrom)}</span>
            <span className="text-[11px] text-food-textMuted"> / {food.unit}</span>
          </p>
          <Link
            href={href}
            className="flex items-center gap-1.5 h-9 border-2 border-food-primary text-food-primary hover:bg-food-primary hover:text-white active:scale-[0.98] transition text-[13px] font-bold rounded-full px-3.5"
          >
            <i className="fa-solid fa-comment-dots text-xs" aria-hidden="true" /> Xem đánh giá
          </Link>
        </div>
      </div>
    </article>
  );
}

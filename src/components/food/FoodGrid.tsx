import FoodCard from "@/components/food/FoodCard";
import type { Food, FoodCategory } from "@prisma/client";

export default function FoodGrid({
  foods,
  categories,
  favorites,
  onToggleFavorite,
}: {
  foods: Food[];
  categories: FoodCategory[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}) {
  if (foods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white border border-[#EAF0F6] rounded-2xl">
        <span className="w-14 h-14 rounded-full bg-food-light text-food-primary flex items-center justify-center text-2xl mb-3">
          <i className="fa-solid fa-utensils" aria-hidden="true" />
        </span>
        <p className="font-bold text-food-text">Không tìm thấy món ăn phù hợp</p>
        <p className="text-sm text-food-textMuted mt-1">Hãy thử đổi từ khóa hoặc chọn danh mục khác nhé.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {foods.map((food) => (
        <FoodCard
          key={food.id}
          food={food}
          categories={categories}
          isFavorite={favorites.has(food.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

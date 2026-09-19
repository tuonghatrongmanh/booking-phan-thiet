"use client";

import type { FoodCategory } from "@prisma/client";

// Thanh danh muc dang pill ngang (icon ben trai + nhan) - KHONG dung gradient, active
// la mau xanh solid duy nhat theo dung yeu cau thiet ke "khong gradient toan section".
export default function FoodCategories({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: FoodCategory[];
  activeCategory: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap">
      {categories.map((cat) => {
        const active = cat.id === activeCategory;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            aria-pressed={active}
            className={`shrink-0 flex items-center gap-2 h-[50px] px-[22px] rounded-2xl border font-bold text-[14px] transition-colors duration-200 ${
              active
                ? "bg-food-primary border-food-primary text-white shadow-[0_5px_15px_rgba(0,59,149,0.35)]"
                : "bg-white border-[#E5EDF5] text-food-textMuted hover:bg-brand-sky hover:text-food-primary hover:border-brand-blueMid"
            }`}
          >
            <i className={`${cat.icon} text-[18px]`} aria-hidden="true" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

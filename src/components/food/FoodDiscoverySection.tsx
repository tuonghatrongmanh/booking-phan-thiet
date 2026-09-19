"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import FoodSearch from "@/components/food/FoodSearch";
import FoodCategories from "@/components/food/FoodCategories";
import SectionHeader from "@/components/food/SectionHeader";
import FoodGrid from "@/components/food/FoodGrid";
import type { Food, FoodCategory } from "@prisma/client";

const FAVORITES_KEY = "bpt_food_favorites";
type SortBy = "rating" | "popular" | "price-asc" | "price-desc";

export default function FoodDiscoverySection({
  categories,
  foods,
  sidebar,
}: {
  categories: FoodCategory[];
  foods: Food[];
  sidebar: ReactNode;
}) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("rating");
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      } catch {
        // storage unavailable — favorite still works for this session
      }
      return next;
    });
  };

  const visibleFoods = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = foods.filter((food) => {
      const matchesCategory = !activeCategory || food.categoryId === activeCategory;
      const matchesQuery =
        !q || food.name.toLowerCase().includes(q) || food.restaurant.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "popular") return b.reviewCount - a.reviewCount;
      if (sortBy === "price-asc") return a.priceFrom - b.priceFrom;
      return b.priceFrom - a.priceFrom;
    });
  }, [foods, activeCategory, searchQuery, sortBy]);
  const PAGE_SIZE = 8;
  const totalPages = Math.max(1, Math.ceil(visibleFoods.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageFoods = visibleFoods.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <section className="container-custom pb-8 sm:pb-10">
      <div className="relative z-10 -mt-14 sm:-mt-9">
        <FoodSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="mt-6">
        <FoodCategories categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-8 items-start">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeader
              icon="fa-solid fa-fish"
              title="Món ngon nổi bật"
              subtitle="Những món ăn được du khách yêu thích nhất tại Phan Thiết"
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-food-textMuted mb-4">
              Sắp xếp
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="bg-white border border-[#E3ECF5] rounded-full px-3 py-1.5 text-food-text focus:outline-none focus:ring-2 focus:ring-food-primary/30"
              >
                <option value="rating">Đánh giá cao</option>
                <option value="popular">Phổ biến</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </label>
          </div>

          <FoodGrid foods={pageFoods} categories={categories} favorites={favorites} onToggleFavorite={toggleFavorite} />

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-1.5 mt-6" aria-label="Phân trang">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Trang trước"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold border border-[#E3ECF5] text-food-textMuted hover:bg-food-bg transition disabled:opacity-40 disabled:pointer-events-none"
              >
                <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-current={p === currentPage ? "page" : undefined}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                    p === currentPage ? "bg-food-primary text-white" : "border border-[#E3ECF5] text-food-text hover:bg-food-bg"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Trang sau"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold border border-[#E3ECF5] text-food-textMuted hover:bg-food-bg transition disabled:opacity-40 disabled:pointer-events-none"
              >
                <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>

        <div className="space-y-5 lg:sticky lg:top-[98px]">{sidebar}</div>
      </div>
    </section>
  );
}

"use client";

export default function FoodSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="w-full sm:max-w-[640px] mx-auto flex items-center gap-1.5 bg-white rounded-full shadow-[0_10px_30px_-10px_rgba(6,47,95,0.35)] p-1.5 pl-5 focus-within:ring-2 focus-within:ring-food-primary/40 transition-shadow"
    >
      <i className="fa-solid fa-magnifying-glass text-food-textMuted" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tìm kiếm món ăn, nhà hàng, đặc sản..."
        className="flex-1 min-w-0 h-11 sm:h-12 bg-transparent border-0 outline-none text-sm text-food-text placeholder:text-food-textMuted"
      />
      <button
        type="submit"
        className="shrink-0 h-11 sm:h-12 px-5 sm:px-6 rounded-[22px] bg-food-primary hover:brightness-95 active:scale-[0.98] transition text-white text-sm font-bold flex items-center gap-2"
      >
        <i className="fa-solid fa-magnifying-glass sm:hidden" aria-hidden="true" />
        <span className="hidden sm:inline">Tìm kiếm</span>
      </button>
    </form>
  );
}

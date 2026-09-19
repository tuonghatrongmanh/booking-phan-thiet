import Link from "next/link";

export type CategoryCount = { name: string; count: number };

const CATEGORY_ICON: Record<string, string> = {
  "Kinh nghiệm": "fa-solid fa-compass",
  "Địa điểm": "fa-solid fa-location-dot",
  "Ẩm thực": "fa-solid fa-utensils",
  "Trải nghiệm": "fa-solid fa-camera-retro",
};

// Dau trang Tin tuc: dai mau thuong hieu + hoa van logo, o tim kiem (GET /tin-tuc?q=) va cac
// chip danh muc (4 category thuc te co trong model News, kem so bai that).
export default function BlogHero({
  categories,
  totalCount,
  activeCategory,
  keyword,
}: {
  categories: CategoryCount[];
  totalCount: number;
  activeCategory?: string;
  keyword?: string;
}) {
  const chip = (active: boolean) =>
    `shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
      active ? "bg-white text-brand-blue border-white shadow" : "bg-white/10 text-white border-white/30 hover:bg-white/20"
    }`;

  return (
    <section className="relative overflow-hidden bg-navbar-gradient">
      <div className="absolute inset-0 bg-[url('/images/pattern-bpt-light.png')] bg-[length:520px_420px]" aria-hidden="true" />
      <div className="relative max-w-[1240px] mx-auto px-6 sm:px-8 pt-8 pb-7 sm:pt-10 sm:pb-9">
        <nav className="text-[13px] text-white/75 font-semibold flex items-center gap-1.5 mb-3">
          <Link href="/" className="hover:text-white">Trang chủ</Link>
          <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
          <span className="text-white">Tin tức</span>
        </nav>

        <h1 className="font-display font-extrabold text-white text-[28px] sm:text-[40px] leading-tight">Tin tức &amp; kinh nghiệm du lịch Phan Thiết</h1>
        <p className="text-white/85 mt-2 max-w-2xl text-sm sm:text-base">
          {keyword ? (
            <>
              Kết quả cho &ldquo;<span className="font-bold">{keyword}</span>&rdquo;
            </>
          ) : (
            "Cẩm nang địa điểm, ẩm thực, lịch trình và mẹo hay được cập nhật thường xuyên."
          )}
        </p>

        <form action="/tin-tuc" method="get" className="mt-5 flex items-center bg-white rounded-full shadow-lg p-1.5 pl-5 max-w-xl">
          {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
          <i className="fa-solid fa-magnifying-glass text-slate-400" aria-hidden="true" />
          <input
            name="q"
            defaultValue={keyword ?? ""}
            placeholder="Tìm bài viết: homestay, hải sản, Mũi Né..."
            className="flex-1 min-w-0 bg-transparent px-3 py-2 text-[15px] text-slate-700 focus:outline-none"
            aria-label="Tìm bài viết"
          />
          <button type="submit" className="shrink-0 h-10 px-5 rounded-full bg-brand-blue text-white text-sm font-bold hover:brightness-95 transition">
            Tìm
          </button>
        </form>

        <div data-swipe-hint className="flex gap-2.5 overflow-x-auto scrollbar-none mt-5 -mx-6 px-6 sm:mx-0 sm:px-0 sm:flex-wrap">
          <Link href="/tin-tuc" className={chip(!activeCategory && !keyword)}>
            <i className="fa-solid fa-newspaper" aria-hidden="true" /> Tất cả
            <span className="text-xs opacity-70">{totalCount}</span>
          </Link>
          {categories.map((c) => (
            <Link key={c.name} href={`/tin-tuc?category=${encodeURIComponent(c.name)}`} className={chip(activeCategory === c.name)}>
              <i className={CATEGORY_ICON[c.name] ?? "fa-solid fa-tag"} aria-hidden="true" /> {c.name}
              <span className="text-xs opacity-70">{c.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

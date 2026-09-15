import Link from "next/link";
import PriceRangeFilter from "@/components/places/PriceRangeFilter";
import ExpandableFilterList, { type FilterListItem } from "@/components/places/ExpandableFilterList";

const RATING_OPTIONS = [5, 4, 3];

export default function StayFilterSidebar({
  clearHref,
  applyHref,
  hrefFor,
  stayTypes,
  stayType,
  stayTypeCounts,
  amenityItems,
  minRating,
  areaItems,
}: {
  clearHref: string;
  applyHref: string;
  hrefFor: (overrides: Record<string, string | undefined>) => string;
  stayTypes: { id: string; label: string; icon: string }[];
  stayType?: string;
  stayTypeCounts: Record<string, number>;
  amenityItems: FilterListItem[];
  minRating?: string;
  areaItems: { label: string; count: number; href: string; active: boolean }[];
}) {
  return (
    <aside className="bg-white rounded-2xl shadow-card p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-[15px] text-slate-800">Bộ lọc tìm kiếm</h3>
        <Link href={clearHref} className="text-xs font-semibold text-brand-blue hover:underline">
          Xóa tất cả
        </Link>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-bold text-slate-700 mb-1">Khoảng giá / đêm</p>
        <PriceRangeFilter />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-bold text-slate-700 mb-2.5">Loại chỗ ở</p>
        <div className="space-y-2">
          {stayTypes.map((info) => {
            const key = info.id;
            const active = stayType === key;
            return (
              <Link key={key} href={hrefFor({ stayType: active ? undefined : key })} className="flex items-center gap-2.5 text-sm group">
                <span
                  className={`w-4 h-4 rounded-[4px] border shrink-0 flex items-center justify-center transition ${
                    active ? "bg-brand-blue border-brand-blue" : "border-slate-300 group-hover:border-brand-blue"
                  }`}
                >
                  {active && <i className="fa-solid fa-check text-white text-[9px]" aria-hidden="true" />}
                </span>
                <span className={`flex-1 ${active ? "text-brand-blue font-semibold" : "text-slate-600"}`}>{info.label}</span>
                <span className="text-slate-400 text-xs">({stayTypeCounts[key] ?? 0})</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-bold text-slate-700 mb-2.5">Tiện ích nổi bật</p>
        <ExpandableFilterList items={amenityItems} initialVisible={6} />
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-bold text-slate-700 mb-2.5">Đánh giá</p>
        <div className="space-y-2">
          {RATING_OPTIONS.map((n) => {
            const active = minRating === String(n);
            return (
              <Link
                key={n}
                href={hrefFor({ minRating: active ? undefined : String(n) })}
                className={`flex items-center gap-1.5 text-sm rounded-lg px-1.5 py-1 -mx-1.5 transition ${
                  active ? "text-brand-blue font-semibold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={i < n ? "fa-solid fa-star text-brand-gold text-xs" : "fa-solid fa-star text-slate-200 text-xs"}
                    aria-hidden="true"
                  />
                ))}
                {n < 5 && <span>trở lên</span>}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <p className="text-sm font-bold text-slate-700 mb-2.5">Khu vực</p>
        <div className="space-y-2">
          {areaItems.map((a) => (
            <Link key={a.label} href={a.href} className="flex items-center gap-2.5 text-sm group">
              <span
                className={`w-4 h-4 rounded-[4px] border shrink-0 flex items-center justify-center transition ${
                  a.active ? "bg-brand-blue border-brand-blue" : "border-slate-300 group-hover:border-brand-blue"
                }`}
              >
                {a.active && <i className="fa-solid fa-check text-white text-[9px]" aria-hidden="true" />}
              </span>
              <span className={`flex-1 ${a.active ? "text-brand-blue font-semibold" : "text-slate-600"}`}>{a.label}</span>
              <span className="text-slate-400 text-xs">({a.count})</span>
            </Link>
          ))}
        </div>
      </div>

      <Link
        href={applyHref}
        className="block text-center bg-brand-blue hover:brightness-95 transition text-white text-sm font-bold rounded-xl py-2.5"
      >
        Áp dụng bộ lọc
      </Link>
    </aside>
  );
}

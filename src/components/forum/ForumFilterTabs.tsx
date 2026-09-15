import Link from "next/link";
import { POST_TYPES, type PostTypeKey } from "@/lib/forum";

const TYPE_KEYS = Object.keys(POST_TYPES) as PostTypeKey[];

function buildHref(categorySlug: string, params: { type?: string; sort?: string; tag?: string }) {
  const sp = new URLSearchParams();
  if (params.type) sp.set("type", params.type);
  if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
  if (params.tag) sp.set("tag", params.tag);
  const qs = sp.toString();
  return `/${categorySlug}${qs ? `?${qs}` : ""}`;
}

export default function ForumFilterTabs({
  categorySlug,
  activeType,
  sort,
  tag,
}: {
  categorySlug: string;
  activeType?: string;
  sort: string;
  tag?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card px-4 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        <Link
          href={buildHref(categorySlug, { sort, tag })}
          className={`shrink-0 text-sm font-bold px-3 py-1.5 rounded-full transition ${
            !activeType ? "text-brand-blue border-b-2 border-brand-blue" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Tất cả
        </Link>
        {TYPE_KEYS.map((key) => (
          <Link
            key={key}
            href={buildHref(categorySlug, { type: key, sort, tag })}
            className={`shrink-0 text-sm font-bold px-3 py-1.5 rounded-full transition ${
              activeType === key ? "text-brand-blue border-b-2 border-brand-blue" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {POST_TYPES[key].label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-sm text-slate-500 shrink-0">
        <span className="hidden sm:inline">Sắp xếp:</span>
        <Link
          href={buildHref(categorySlug, { type: activeType, sort: "newest", tag })}
          className={`font-semibold px-2 py-1 rounded-lg ${sort !== "top" ? "text-brand-blue bg-brand-sky" : "hover:bg-slate-50"}`}
        >
          Mới nhất
        </Link>
        <Link
          href={buildHref(categorySlug, { type: activeType, sort: "top", tag })}
          className={`font-semibold px-2 py-1 rounded-lg ${sort === "top" ? "text-brand-blue bg-brand-sky" : "hover:bg-slate-50"}`}
        >
          Nổi bật
        </Link>
      </div>
    </div>
  );
}

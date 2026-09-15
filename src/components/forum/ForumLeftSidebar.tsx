import Link from "next/link";
import Image from "next/image";
import { POST_TYPES, type PostTypeKey } from "@/lib/forum";

type Hashtag = { id: string; tag: string; count: number };
type Member = { id: string; name: string; avatar: string; points: number };

const TYPE_COLOR: Record<PostTypeKey, string> = {
  POST: "text-brand-blue",
  REVIEW: "text-brand-gold",
  QUESTION: "text-brand-red",
  EXPERIENCE: "text-brand-green",
};

export default function ForumLeftSidebar({
  categorySlug,
  activeType,
  sort,
  hashtags,
  members,
}: {
  categorySlug: string;
  activeType?: string;
  sort: string;
  hashtags: Hashtag[];
  members: Member[];
}) {
  return (
    <aside className="space-y-4 hidden lg:block sticky top-[98px] max-h-[calc(100vh-110px)] overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-card p-3">
        <Link
          href={`/${categorySlug}`}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
            !activeType && sort !== "top" ? "bg-brand-blue text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <i className={`fa-solid fa-house w-4 text-center ${!activeType && sort !== "top" ? "" : "text-brand-blue"}`} aria-hidden="true" />{" "}
          Tất cả bài viết
        </Link>
        <Link
          href={`/${categorySlug}?sort=top`}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
            !activeType && sort === "top" ? "bg-brand-blue text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <i className={`fa-solid fa-star w-4 text-center ${!activeType && sort === "top" ? "" : "text-brand-gold"}`} aria-hidden="true" />{" "}
          Bài viết nổi bật
        </Link>
        <Link
          href={`/${categorySlug}?sort=newest`}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition text-slate-600 hover:bg-slate-50`}
        >
          <i className="fa-solid fa-clock w-4 text-center text-slate-400" aria-hidden="true" /> Bài viết mới nhất
        </Link>
        <div className="my-1.5 h-px bg-slate-100" />
        {(Object.keys(POST_TYPES) as PostTypeKey[]).map((key) => (
          <Link
            key={key}
            href={`/${categorySlug}?type=${key}`}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeType === key ? "bg-brand-blue text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <i
              className={`${POST_TYPES[key].icon} w-4 text-center ${activeType === key ? "" : TYPE_COLOR[key]}`}
              aria-hidden="true"
            />{" "}
            {POST_TYPES[key].label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4">
        <h3 className="font-display font-bold text-sm text-slate-800 mb-3">Chủ đề hot</h3>
        <div className="space-y-1">
          {hashtags.length === 0 && <p className="text-xs text-slate-400">Chưa có chủ đề nào.</p>}
          {hashtags.map((h) => (
            <Link
              key={h.id}
              href={`/${categorySlug}?tag=${encodeURIComponent(h.tag)}`}
              className="flex items-center justify-between text-sm px-2 py-1.5 rounded-lg hover:bg-slate-50 transition"
            >
              <span className="text-brand-blue font-semibold truncate"># {h.tag}</span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 shrink-0 ml-2">
                {h.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4">
        <h3 className="font-display font-bold text-sm text-slate-800 mb-3">Top thành viên</h3>
        <div className="space-y-2.5">
          {members.length === 0 && <p className="text-xs text-slate-400">Chưa có thành viên nổi bật.</p>}
          {members.map((m, i) => (
            <div key={m.id} className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-brand-sky ring-2 ring-brand-sky">
                <Image src={m.avatar} alt={m.name} fill sizes="32px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                <p className="text-xs text-slate-400">{m.points.toLocaleString("vi-VN")} điểm</p>
              </div>
              {i === 0 && <i className="fa-solid fa-crown text-brand-gold shrink-0" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

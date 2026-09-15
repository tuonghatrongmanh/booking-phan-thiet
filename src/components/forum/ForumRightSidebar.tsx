import Link from "next/link";
import Image from "next/image";
import TimeAgo from "./TimeAgo";

type Place = { id: string; name: string; address: string | null; avatar: string | null; avgRating: number; reviewCount: number };
type Activity = { id: string; actorName: string; actorAvatar: string; verb: "posted" | "commented" | "reacted"; targetTitle: string; postId: string; categorySlug: string; createdAt: string };
type Stats = { members: number; posts: number; reviews: number; comments: number };

const VERB_LABEL = {
  posted: "đã đăng bài mới",
  commented: "đã bình luận bài viết",
  reacted: "đã đánh giá",
};

export default function ForumRightSidebar({
  places,
  activity,
  stats,
}: {
  places: Place[];
  activity: Activity[];
  stats: Stats;
}) {
  return (
    <aside className="space-y-4 hidden xl:block sticky top-[98px] max-h-[calc(100vh-110px)] overflow-y-auto scrollbar-none">
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-sm text-slate-800">Homestay được yêu thích</h3>
          <Link href="/luu-tru" className="text-xs font-bold text-brand-blue">
            Xem tất cả
          </Link>
        </div>
        <div className="space-y-3">
          {places.length === 0 && <p className="text-xs text-slate-400">Chưa có dữ liệu.</p>}
          {places.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                {p.avatar && <Image src={p.avatar} alt={p.name} fill sizes="48px" className="object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <i className="fa-solid fa-star text-brand-gold" aria-hidden="true" /> {p.avgRating.toFixed(1)} ({p.reviewCount} đánh giá)
                </p>
                {p.address && (
                  <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                    <i className="fa-solid fa-location-dot" aria-hidden="true" /> {p.address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4">
        <h3 className="font-display font-bold text-sm text-slate-800 mb-3">Hoạt động nổi bật</h3>
        <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-none pr-1">
          {activity.length === 0 && <p className="text-xs text-slate-400">Chưa có hoạt động nào.</p>}
          {activity.map((a) => (
            <Link key={a.id} href={`/${a.categorySlug}/${a.postId}`} className="flex items-start gap-2.5 group">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-brand-sky">
                <Image src={a.actorAvatar} alt={a.actorName} fill sizes="32px" className="object-cover" />
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                <span className="font-bold text-slate-800 group-hover:text-brand-blue">{a.actorName}</span>{" "}
                {VERB_LABEL[a.verb]} <span className="font-semibold text-slate-700">{a.targetTitle}</span>
                <br />
                <TimeAgo date={a.createdAt} className="text-slate-400" />
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4">
        <h3 className="font-display font-bold text-sm text-slate-800 mb-3">Thống kê cộng đồng</h3>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="font-display font-extrabold text-lg text-brand-blue">{stats.members.toLocaleString("vi-VN")}+</p>
            <p className="text-[11px] text-slate-400">Thành viên</p>
          </div>
          <div>
            <p className="font-display font-extrabold text-lg text-brand-blue">{stats.posts.toLocaleString("vi-VN")}+</p>
            <p className="text-[11px] text-slate-400">Bài viết</p>
          </div>
          <div>
            <p className="font-display font-extrabold text-lg text-brand-blue">{stats.reviews.toLocaleString("vi-VN")}+</p>
            <p className="text-[11px] text-slate-400">Đánh giá</p>
          </div>
          <div>
            <p className="font-display font-extrabold text-lg text-brand-blue">{stats.comments.toLocaleString("vi-VN")}+</p>
            <p className="text-[11px] text-slate-400">Bình luận</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import AdminRankEditor from "@/components/admin/AdminRankEditor";
import Pagination from "@/components/admin/Pagination";
import { FORUM_CATEGORIES } from "@/lib/forum";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function AdminForumListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, posts, hashtags, members] = await Promise.all([
    prisma.forumPost.count(),
    prisma.forumPost.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        authorUser: { select: { name: true } },
        authorAdmin: { select: { name: true } },
        _count: { select: { comments: true, reactions: true } },
      },
    }),
    prisma.hashtag.findMany({ orderBy: { count: "desc" }, take: 20 }),
    prisma.user.findMany({ orderBy: { points: "desc" }, take: 20, select: { id: true, name: true, points: true, rankOverride: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Diễn đàn</h1>
          <p className="text-slate-400">Quản lý bài đăng ở 3 mục diễn đàn (Nghỉ dưỡng, Quán nhậu, Quán cà phê)</p>
        </div>
        <Link
          href="/admin/forum/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Đăng bài mới
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {posts.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có bài đăng nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Bài đăng</th>
                <th className="px-5 py-3 font-semibold">Danh mục</th>
                <th className="px-5 py-3 font-semibold">Tác giả</th>
                <th className="px-5 py-3 font-semibold">Tương tác</th>
                <th className="px-5 py-3 font-semibold">Ngày đăng</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const slug = (Object.keys(FORUM_CATEGORIES) as Array<keyof typeof FORUM_CATEGORIES>).find(
                  (s) => FORUM_CATEGORIES[s].enum === post.category
                )!;
                return (
                  <tr key={post.id} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      <Link href={`/${slug}/${post.id}`} target="_blank" className="font-semibold text-slate-800 hover:text-brand-blue line-clamp-1">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{FORUM_CATEGORIES[slug].label}</td>
                    <td className="px-5 py-3 text-slate-500">{post.authorUser?.name ?? post.authorAdmin?.name ?? "Ẩn danh"}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {post._count.reactions} cảm xúc · {post._count.comments} bình luận
                    </td>
                    <td className="px-5 py-3 text-slate-500">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td className="px-5 py-3 text-right">
                      <DeleteButton url={`/api/forum/posts/${post.id}`} confirmText="Xóa bài đăng này?" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/forum?page=${p}`} />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-bold text-slate-800 mb-1">Xếp hạng hashtag</h2>
          <p className="text-xs text-slate-400 mb-4">Ghim số thứ tự để cố định vị trí ở "Chủ đề hot" (để trống = tự động theo lượt dùng)</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {hashtags.length === 0 && <p className="text-sm text-slate-400">Chưa có hashtag nào.</p>}
            {hashtags.map((h) => (
              <div key={h.id} className="flex items-center justify-between border-b border-slate-50 pb-2">
                <div>
                  <p className="text-sm font-semibold text-brand-blue">#{h.tag}</p>
                  <p className="text-xs text-slate-400">{h.count} lượt dùng{h.pinnedRank != null && ` · đang ghim #${h.pinnedRank}`}</p>
                </div>
                <AdminRankEditor endpoint={`/api/forum/hashtags/${h.id}`} field="pinnedRank" currentRank={h.pinnedRank} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="font-display font-bold text-slate-800 mb-1">Xếp hạng thành viên</h2>
          <p className="text-xs text-slate-400 mb-4">Ghim số thứ tự để cố định vị trí ở "Top thành viên" (để trống = tự động theo điểm)</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {members.length === 0 && <p className="text-sm text-slate-400">Chưa có thành viên nào.</p>}
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between border-b border-slate-50 pb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.points} điểm{m.rankOverride != null && ` · đang ghim #${m.rankOverride}`}</p>
                </div>
                <AdminRankEditor endpoint={`/api/users/${m.id}/rank`} field="rankOverride" currentRank={m.rankOverride} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

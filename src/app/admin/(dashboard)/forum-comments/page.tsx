import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";
import { enumToSlug } from "@/lib/forum";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function AdminForumCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, comments] = await Promise.all([
    prisma.forumComment.count(),
    prisma.forumComment.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        author: { select: { name: true, avatar: true } },
        post: { select: { id: true, title: true, category: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800">Kiểm duyệt bình luận</h1>
        <p className="text-slate-400">Xóa bình luận vi phạm/spam trên diễn đàn ({total} bình luận)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {comments.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có bình luận nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Người bình luận</th>
                <th className="px-5 py-3 font-semibold">Nội dung</th>
                <th className="px-5 py-3 font-semibold">Bài viết</th>
                <th className="px-5 py-3 font-semibold">Thời gian</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap">{c.author.name}</td>
                  <td className="px-5 py-3 text-slate-500 max-w-[320px]">
                    <p className="line-clamp-2">{c.content}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/${enumToSlug(c.post.category)}/${c.post.id}`}
                      target="_blank"
                      className="text-brand-blue hover:underline line-clamp-1 max-w-[200px] inline-block"
                    >
                      {c.post.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <DeleteButton url={`/api/forum/comments/${c.id}`} confirmText="Xóa bình luận này?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/forum-comments?page=${p}`} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function AdminNewsListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, news] = await Promise.all([
    prisma.news.count(),
    prisma.news.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { author: { select: { name: true } } },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Tin tức</h1>
          <p className="text-slate-400">Quản lý bài viết hiển thị ở trang chủ</p>
        </div>
        <Link
          href="/admin/news/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Đăng bài mới
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {news.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có bài viết nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Bài viết</th>
                <th className="px-5 py-3 font-semibold">Tác giả</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Ngày đăng</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <Image src={item.coverImage} alt="" fill className="object-cover" />
                      </div>
                      <span className="font-semibold text-slate-800 line-clamp-1">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{item.author.name}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        item.published ? "text-brand-green bg-brand-greenBg" : "text-slate-500 bg-slate-100"
                      }`}
                    >
                      {item.published ? "Đã xuất bản" : "Nháp"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/news/${item.id}/edit`}
                      className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/news/${item.id}`} confirmText="Xóa bài viết này?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/news?page=${p}`} />
    </div>
  );
}

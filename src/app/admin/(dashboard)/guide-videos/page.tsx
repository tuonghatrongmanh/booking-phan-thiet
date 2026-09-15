import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function AdminGuideVideosListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, videos] = await Promise.all([
    prisma.guideVideo.count(),
    prisma.guideVideo.findMany({ orderBy: { sortOrder: "asc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Video hướng dẫn</h1>
          <p className="text-slate-400">Video hướng dẫn Sale uy tín cách lấy link TikTok, cách dùng hồ sơ, và những điều cần tránh — hiển thị trong khối &quot;Hồ sơ Sale&quot; ở trang tài khoản</p>
        </div>
        <Link
          href="/admin/guide-videos/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm video
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {videos.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có video hướng dẫn nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Thứ tự</th>
                <th className="px-5 py-3 font-semibold">Tiêu đề</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-500">{v.sortOrder}</td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{v.title}</p>
                    {v.caption && <p className="text-xs text-slate-400 line-clamp-1">{v.caption}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        v.active ? "text-brand-green bg-brand-greenBg" : "text-slate-500 bg-slate-100"
                      }`}
                    >
                      {v.active ? "Đang hiển thị" : "Đã ẩn"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/guide-videos/${v.id}/edit`}
                      className="text-brand-blue hover:bg-sky-50 rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/guide-videos/${v.id}`} confirmText="Xóa video hướng dẫn này?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/guide-videos?page=${p}`} />
    </div>
  );
}

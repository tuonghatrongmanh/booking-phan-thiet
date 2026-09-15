import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function AdminHeroTilesListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, tiles] = await Promise.all([
    prisma.heroTile.count(),
    prisma.heroTile.findMany({ orderBy: { sortOrder: "asc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Ô danh mục trang chủ</h1>
          <p className="text-slate-400">Quản lý các ô Homestay / Villa / Quán nhậu / Quán cà phê... hiển thị ngay dưới banner trang chủ</p>
        </div>
        <Link
          href="/admin/hero-tiles/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm ô danh mục
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {tiles.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có ô danh mục nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Thứ tự</th>
                <th className="px-5 py-3 font-semibold">Ô danh mục</th>
                <th className="px-5 py-3 font-semibold">Liên kết</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tiles.map((tile) => (
                <tr key={tile.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-500">{tile.sortOrder}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <Image src={tile.image} alt="" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1 flex items-center gap-1.5">
                          {tile.label}
                          {tile.special && (
                            <span className="text-[10px] font-extrabold text-white bg-brand-gold px-1.5 py-0.5 rounded-full">HOT</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">{tile.tagText}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{tile.href}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        tile.active ? "text-brand-green bg-brand-greenBg" : "text-slate-500 bg-slate-100"
                      }`}
                    >
                      {tile.active ? "Đang hiển thị" : "Đã ẩn"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/hero-tiles/${tile.id}/edit`}
                      className="text-brand-blue hover:bg-sky-50 rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/hero-tiles/${tile.id}`} confirmText="Xóa ô danh mục này?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/hero-tiles?page=${p}`} />
    </div>
  );
}

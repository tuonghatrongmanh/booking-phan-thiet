import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function AdminBrandLogosListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, logos] = await Promise.all([
    prisma.brandLogo.count(),
    prisma.brandLogo.findMany({ orderBy: { sortOrder: "asc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Thương hiệu đối tác</h1>
          <p className="text-slate-400">Quản lý dải logo carousel "Được tin tưởng bởi" ở trang chủ</p>
        </div>
        <Link
          href="/admin/brand-logos/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm logo
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {logos.length === 0 ? (
          <p className="p-8 text-center text-slate-400">
            Chưa có logo nào — dải "Được tin tưởng bởi" đang tự động ẩn ở trang chủ.
          </p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Logo</th>
                <th className="px-5 py-3 font-semibold">Liên kết</th>
                <th className="px-5 py-3 font-semibold">Thứ tự</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {logos.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                        <Image src={l.image} alt="" fill className="object-contain p-1" />
                      </div>
                      <p className="font-semibold text-slate-800">{l.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{l.href || "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{l.sortOrder}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        l.active ? "text-brand-green bg-brand-greenBg" : "text-slate-500 bg-slate-100"
                      }`}
                    >
                      {l.active ? "Đang hiện" : "Đã tắt"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/brand-logos/${l.id}/edit`}
                      className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/brand-logos/${l.id}`} confirmText="Xóa logo này?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/brand-logos?page=${p}`} />
    </div>
  );
}

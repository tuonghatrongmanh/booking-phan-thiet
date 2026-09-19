import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import Pagination from "@/components/admin/Pagination";
import { formatFoodPrice } from "@/lib/food-categories";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function AdminLocalSpecialtiesListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, items] = await Promise.all([
    prisma.localSpecialty.count(),
    prisma.localSpecialty.findMany({ orderBy: { sortOrder: "asc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Đặc sản Phan Thiết</h1>
          <p className="text-slate-400">Quản lý khối &quot;Đặc sản Phan Thiết&quot; (mang về) ở cuối trang Ẩm thực</p>
        </div>
        <Link
          href="/admin/local-specialties/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {items.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có sản phẩm nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Sản phẩm</th>
                <th className="px-5 py-3 font-semibold">Giá</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {s.image ? (
                        <span className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          <Image src={s.image} alt="" fill className="object-cover" />
                        </span>
                      ) : (
                        <span className="w-9 h-9 rounded-lg bg-food-light text-food-primary flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-utensils" aria-hidden="true" />
                        </span>
                      )}
                      <p className="font-semibold text-slate-800 line-clamp-1">{s.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatFoodPrice(s.price)} / {s.unit}
                  </td>
                  <td className="px-5 py-3">
                    <ToggleActiveButton url={`/api/local-specialties/${s.id}`} active={s.active} activeLabel="Hiện" inactiveLabel="Ẩn" />
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/local-specialties/${s.id}/edit`}
                      className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/local-specialties/${s.id}`} confirmText={`Xóa "${s.name}"?`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/local-specialties?page=${p}`} />
    </div>
  );
}

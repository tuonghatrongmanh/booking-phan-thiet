import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";
import Pagination from "@/components/admin/Pagination";
import { categoryLabel, formatFoodPrice } from "@/lib/food-categories";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function AdminFoodsListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, foods, categories] = await Promise.all([
    prisma.food.count(),
    prisma.food.findMany({ orderBy: { sortOrder: "asc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.foodCategory.findMany(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Món ăn</h1>
          <p className="text-slate-400">Quản lý danh sách món ăn ở trang Ẩm thực</p>
        </div>
        <Link
          href="/admin/foods/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm món ăn
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {foods.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có món ăn nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[860px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Món ăn</th>
                <th className="px-5 py-3 font-semibold">Danh mục</th>
                <th className="px-5 py-3 font-semibold">Đánh giá</th>
                <th className="px-5 py-3 font-semibold">Giá</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((f) => (
                <tr key={f.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {f.image ? (
                        <span className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          <Image src={f.image} alt="" fill className="object-cover" />
                        </span>
                      ) : (
                        <span className="w-9 h-9 rounded-lg bg-food-light text-food-primary flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-utensils" aria-hidden="true" />
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1">{f.name}</p>
                        <p className="text-xs text-slate-400">{f.restaurant}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{categoryLabel(categories, f.categoryId)}</td>
                  <td className="px-5 py-3 text-slate-500">
                    <i className="fa-solid fa-star text-amber-400 mr-1" aria-hidden="true" />
                    {f.rating.toFixed(1)} ({f.reviewCount})
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatFoodPrice(f.priceFrom)} / {f.unit}
                  </td>
                  <td className="px-5 py-3 space-x-1.5">
                    <ToggleActiveButton url={`/api/foods/${f.id}`} active={f.active} activeLabel="Hiện" inactiveLabel="Ẩn" />
                    {f.verified && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full text-brand-green bg-brand-greenBg">
                        <i className="fa-solid fa-shield-check mr-1" aria-hidden="true" /> Đã kiểm duyệt
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/foods/${f.id}/edit`}
                      className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/foods/${f.id}`} confirmText={`Xóa món "${f.name}"?`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/foods?page=${p}`} />
    </div>
  );
}

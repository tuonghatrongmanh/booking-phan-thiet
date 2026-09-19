import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";

export const dynamic = "force-dynamic";

export default async function AdminFoodCategoriesListPage() {
  const categories = await prisma.foodCategory.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Danh mục món ăn</h1>
          <p className="text-slate-400">Quản lý các danh mục lọc (Hải sản, Món nướng...) ở trang Ẩm thực</p>
        </div>
        <Link
          href="/admin/food-categories/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm danh mục
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {categories.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có danh mục nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Danh mục</th>
                <th className="px-5 py-3 font-semibold">Mã</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-food-light text-food-primary flex items-center justify-center shrink-0">
                        <i className={c.icon} aria-hidden="true" />
                      </span>
                      <p className="font-semibold text-slate-800">{c.label}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 font-mono text-xs">{c.id}</td>
                  <td className="px-5 py-3">
                    <ToggleActiveButton url={`/api/food-categories/${c.id}`} active={c.active} activeLabel="Hiện" inactiveLabel="Ẩn" />
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/food-categories/${c.id}/edit`}
                      className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/food-categories/${c.id}`} confirmText={`Xóa danh mục "${c.label}"?`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

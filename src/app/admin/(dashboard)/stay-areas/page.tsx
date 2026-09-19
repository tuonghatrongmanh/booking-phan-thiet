import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";

export const dynamic = "force-dynamic";

export default async function AdminStayAreasPage() {
  const areas = await prisma.stayArea.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Khu vực</h1>
          <p className="text-slate-400">Quản lý bộ lọc "Khu vực" ở trang Lưu trú (Mũi Né, Hàm Tiến...)</p>
        </div>
        <Link
          href="/admin/stay-areas/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm khu vực
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {areas.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có khu vực nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Khu vực</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((a) => (
                <tr key={a.label} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-semibold text-slate-800">{a.label}</td>
                  <td className="px-5 py-3">
                    <ToggleActiveButton url={`/api/stay-areas/${encodeURIComponent(a.label)}`} active={a.active} activeLabel="Hiện" inactiveLabel="Ẩn" />
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/stay-areas/${encodeURIComponent(a.label)}/edit`}
                      className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/stay-areas/${encodeURIComponent(a.label)}`} confirmText={`Xóa khu vực "${a.label}"?`} />
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

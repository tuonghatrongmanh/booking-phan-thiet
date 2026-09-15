import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";

export const dynamic = "force-dynamic";

export default async function AdminStayAmenitiesPage() {
  const amenities = await prisma.stayAmenity.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Tiện ích</h1>
          <p className="text-slate-400">Quản lý danh sách tiện ích chỗ ở (Wi-Fi, hồ bơi...) ở trang Lưu trú</p>
        </div>
        <Link
          href="/admin/stay-amenities/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm tiện ích
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {amenities.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có tiện ích nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Tiện ích</th>
                <th className="px-5 py-3 font-semibold">Mô tả</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {amenities.map((a) => (
                <tr key={a.label} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-brand-sky text-brand-blue flex items-center justify-center shrink-0">
                        <i className={a.icon} aria-hidden="true" />
                      </span>
                      <span className="font-semibold text-slate-800">{a.label}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{a.subtitle || "—"}</td>
                  <td className="px-5 py-3">
                    <ToggleActiveButton url={`/api/stay-amenities/${encodeURIComponent(a.label)}`} active={a.active} activeLabel="Hiện" inactiveLabel="Ẩn" />
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/stay-amenities/${encodeURIComponent(a.label)}/edit`}
                      className="text-brand-blue hover:bg-sky-50 rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/stay-amenities/${encodeURIComponent(a.label)}`} confirmText={`Xóa tiện ích "${a.label}"?`} />
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

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";

export const dynamic = "force-dynamic";

export default async function AdminStayTypesPage() {
  const types = await prisma.stayTypeSetting.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800">Danh mục chỗ ở</h1>
        <p className="text-slate-400">
          Đổi tên/icon/thứ tự/ẩn hiện cho 5 loại chỗ ở cố định (Homestay, Villa, Resort, Bungalow, Căn hộ). Không thêm được loại mới.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-5 py-3 font-semibold">Loại chỗ ở</th>
              <th className="px-5 py-3 font-semibold">Trạng thái</th>
              <th className="px-5 py-3 font-semibold text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-brand-sky text-brand-blue flex items-center justify-center shrink-0">
                      <i className={t.icon} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{t.label}</p>
                      <p className="text-xs text-slate-400">{t.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <ToggleActiveButton url={`/api/stay-types/${t.id}`} active={t.active} activeLabel="Hiện" inactiveLabel="Ẩn" />
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/stay-types/${t.id}/edit`}
                    className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                  >
                    Sửa
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

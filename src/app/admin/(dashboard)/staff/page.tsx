import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";

export const dynamic = "force-dynamic";

function formatDateTime(date: Date | null) {
  if (!date) return "Chưa từng đăng nhập";
  return new Date(date).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminStaffPage() {
  const staff = await prisma.admin.findMany({
    where: { role: { not: "SUPER_ADMIN" } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Nhân viên</h1>
          <p className="text-slate-400">Tạo tài khoản, cấp quyền, theo dõi hoạt động của nhân viên</p>
        </div>
        <Link
          href="/admin/staff/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm nhân viên
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {staff.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có tài khoản nhân viên nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Nhân viên</th>
                <th className="px-5 py-3 font-semibold">Đăng nhập gần nhất</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDateTime(s.lastLoginAt)}</td>
                  <td className="px-5 py-3">
                    <ToggleActiveButton
                      url={`/api/admin/staff/${s.id}`}
                      active={s.active}
                      activeLabel="Đang hoạt động"
                      inactiveLabel="Đã đình chỉ"
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/staff/${s.id}`}
                      className="text-brand-blue hover:bg-sky-50 rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Quản lý quyền & hoạt động
                    </Link>
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

import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-action";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  "reset-password": "Đặt lại mật khẩu",
  "change-master-password": "Đổi mật khẩu chủ",
  "suspend-sale": "Đình chỉ Sale",
  "ban-sale": "Cấm Sale",
  "reactivate-sale-standing": "Bật lại đình chỉ/cấm",
  "deactivate-sale-standing": "Tạm ngưng đình chỉ/cấm",
  "remove-sale-standing": "Gỡ đình chỉ/cấm",
  "approve-sale-appeal": "Chấp thuận khiếu nại",
  "reject-sale-appeal": "Từ chối khiếu nại",
};

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminAuditLogPage() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) redirect("/admin/login");
  if (admin.role !== "SUPER_ADMIN") redirect("/admin");

  const logs = await prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Nhật ký hành động nhạy cảm</h1>
        <p className="text-slate-400">
          Ghi lại các hành động SUPER_ADMIN nhạy cảm nhất (đặt/đổi mật khẩu, đình chỉ/cấm Sale) - không bao gồm tất cả
          hành động quản trị (xem /admin/pending-changes cho luồng duyệt nội dung của nhân viên).
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {logs.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có hành động nào được ghi lại.</p>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Thời gian</th>
                <th className="px-5 py-3 font-semibold">Admin</th>
                <th className="px-5 py-3 font-semibold">Hành động</th>
                <th className="px-5 py-3 font-semibold">Đối tượng</th>
                <th className="px-5 py-3 font-semibold">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(l.createdAt)}</td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-700">{l.adminName}</p>
                    <p className="text-xs text-slate-400">{l.adminEmail}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{ACTION_LABEL[l.action] ?? l.action}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {l.targetType}: {l.targetId}
                  </td>
                  <td className="px-5 py-3 text-slate-500 max-w-[280px]">{l.detail || <span className="text-slate-300">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

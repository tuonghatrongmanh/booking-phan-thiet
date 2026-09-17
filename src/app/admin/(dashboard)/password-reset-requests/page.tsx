import { prisma } from "@/lib/prisma";
import PasswordResetRequestRow from "@/components/admin/PasswordResetRequestRow";

export const dynamic = "force-dynamic";

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminPasswordResetRequestsPage() {
  const requests = await prisma.passwordResetToken.findMany({
    where: { usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Yêu cầu đặt lại mật khẩu</h1>
        <p className="text-slate-400">
          Người dùng đã tự gửi yêu cầu "quên mật khẩu" nhưng hệ thống chưa gửi được email thực sự (chưa cấu hình
          RESEND_API_KEY) - hãy tạo mật khẩu tạm và liên hệ trực tiếp (Zalo/điện thoại) để cung cấp cho họ.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {requests.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Không có yêu cầu nào đang chờ xử lý.</p>
        ) : (
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Tài khoản</th>
                <th className="px-5 py-3 font-semibold">Ngày gửi</th>
                <th className="px-5 py-3 font-semibold">Xử lý</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <PasswordResetRequestRow
                  key={r.id}
                  id={r.id}
                  name={r.user.name}
                  email={r.user.email}
                  phone={r.user.phone}
                  createdAtLabel={formatDateTime(r.createdAt)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

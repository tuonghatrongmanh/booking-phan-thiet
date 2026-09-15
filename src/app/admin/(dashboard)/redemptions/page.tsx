import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RedemptionStatusControl from "@/components/admin/RedemptionStatusControl";

export const dynamic = "force-dynamic";

const TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "FULFILLED", label: "Đã trao thưởng" },
  { value: "CANCELLED", label: "Đã hủy" },
];

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminRedemptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = status && ["PENDING", "FULFILLED", "CANCELLED"].includes(status) ? status : "ALL";

  const redemptions = await prisma.redemption.findMany({
    where: activeStatus === "ALL" ? {} : { status: activeStatus as "PENDING" | "FULFILLED" | "CANCELLED" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      reward: { select: { name: true, coinCost: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Đơn đổi thưởng</h1>
        <p className="text-slate-400">Xác nhận & xử lý các đơn đổi xu lấy quà của người dùng</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value === "ALL" ? "/admin/redemptions" : `/admin/redemptions?status=${t.value}`}
            className={`text-sm font-bold px-4 py-2 rounded-full transition ${
              activeStatus === t.value ? "bg-brand-blue text-white" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {redemptions.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Không có đơn nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Người đổi</th>
                <th className="px-5 py-3 font-semibold">Phần thưởng</th>
                <th className="px-5 py-3 font-semibold">Người nhận</th>
                <th className="px-5 py-3 font-semibold">Địa chỉ nhận</th>
                <th className="px-5 py-3 font-semibold">Xu</th>
                <th className="px-5 py-3 font-semibold">Ngày đặt</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{r.user.name}</p>
                    <p className="text-xs text-slate-400">{r.user.phone || r.user.email}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.reward.name}</td>
                  <td className="px-5 py-3">
                    {r.recipientName ? (
                      <>
                        <p className="font-semibold text-slate-700">{r.recipientName}</p>
                        <p className="text-xs text-slate-400">{r.recipientPhone}</p>
                      </>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-500 max-w-[220px]">{r.addressText || <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{r.coinsSpent.toLocaleString("vi-VN")} xu</td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(r.createdAt)}</td>
                  <td className="px-5 py-3">
                    <RedemptionStatusControl id={r.id} status={r.status} />
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

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import RedemptionStatusControl from "@/components/admin/RedemptionStatusControl";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function AdminRewardsPage() {
  const [rewards, redemptions] = await Promise.all([
    prisma.rewardItem.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.redemption.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: { select: { name: true, email: true, phone: true } }, reward: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">Kho đổi thưởng</h1>
            <p className="text-slate-400">Quản lý phần thưởng đổi bằng xu</p>
          </div>
          <Link
            href="/admin/rewards/new"
            className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
          >
            + Thêm phần thưởng
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
          {rewards.length === 0 ? (
            <p className="p-8 text-center text-slate-400">Chưa có phần thưởng nào.</p>
          ) : (
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-semibold">Phần thưởng</th>
                  <th className="px-5 py-3 font-semibold">Danh mục</th>
                  <th className="px-5 py-3 font-semibold">Giá</th>
                  <th className="px-5 py-3 font-semibold">Còn lại</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {r.image ? (
                          <div className="relative w-12 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                            <Image src={r.image} alt="" fill className="object-cover" />
                          </div>
                        ) : (
                          <span className="w-12 h-10 rounded-lg bg-brand-sky text-brand-blue flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-gift" aria-hidden="true" />
                          </span>
                        )}
                        <p className="font-semibold text-slate-800 line-clamp-1">{r.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{r.category}</td>
                    <td className="px-5 py-3 text-slate-500">{r.coinCost.toLocaleString("vi-VN")} xu</td>
                    <td className="px-5 py-3 text-slate-500">{r.stock === null ? "Không giới hạn" : r.stock}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          r.active ? "text-brand-green bg-brand-greenBg" : "text-slate-500 bg-slate-100"
                        }`}
                      >
                        {r.active ? "Hiện" : "Ẩn"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <Link
                        href={`/admin/rewards/${r.id}/edit`}
                        className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                      >
                        Sửa
                      </Link>
                      <DeleteButton url={`/api/rewards/${r.id}`} confirmText={`Xóa phần thưởng "${r.name}"?`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display font-bold text-xl text-slate-800 mb-4">Yêu cầu đổi thưởng gần đây</h2>
        <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
          {redemptions.length === 0 ? (
            <p className="p-8 text-center text-slate-400">Chưa có yêu cầu đổi thưởng nào.</p>
          ) : (
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-semibold">Người dùng</th>
                  <th className="px-5 py-3 font-semibold">Phần thưởng</th>
                  <th className="px-5 py-3 font-semibold">Xu đã trừ</th>
                  <th className="px-5 py-3 font-semibold">Ngày yêu cầu</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{r.user.name}</p>
                      <p className="text-xs text-slate-400">{r.user.phone || r.user.email}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{r.reward.name}</td>
                    <td className="px-5 py-3 text-slate-500">{r.coinsSpent.toLocaleString("vi-VN")} xu</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(r.createdAt)}</td>
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
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/current-admin";
import { getSectionPermission } from "@/lib/admin-permissions";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import SaleApplicationStatusControl from "@/components/admin/SaleApplicationStatusControl";
import SaleApplicationViewButton from "@/components/admin/SaleApplicationViewButton";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  TRUSTED: "text-brand-green bg-brand-greenBg",
  WARNING: "text-amber-600 bg-amber-50",
  SCAM: "text-brand-red bg-brand-redBg",
};

const STATUS_LABEL: Record<string, string> = {
  TRUSTED: "Uy tín",
  WARNING: "Cần cẩn trọng",
  SCAM: "Đã ghi nhận lừa đảo",
};

export default async function AdminSaleAgentsPage() {
  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin && currentAdmin.role !== "SUPER_ADMIN") {
    const perm = getSectionPermission(currentAdmin.permissions as never, "sale-agents");
    if (!perm.access) redirect("/admin/news");
  }

  const [agents, applications] = await Promise.all([
    prisma.place.findMany({ where: { category: "SALE" }, orderBy: { createdAt: "desc" } }),
    prisma.saleApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: { select: { name: true, email: true, phone: true } }, images: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">Sale uy tín</h1>
            <p className="text-slate-400">Quản lý hồ sơ Sale uy tín hiển thị ở trang chủ</p>
          </div>
          <Link
            href="/admin/sale-agents/new"
            className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
          >
            + Thêm Sale uy tín
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
          {agents.length === 0 ? (
            <p className="p-8 text-center text-slate-400">Chưa có hồ sơ Sale uy tín nào.</p>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tên</th>
                  <th className="px-5 py-3 font-semibold">SĐT</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold">Thứ hạng</th>
                  <th className="px-5 py-3 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-100">
                          {agent.avatar ? <Image src={agent.avatar} alt="" fill className="object-cover" /> : null}
                        </div>
                        <span className="font-semibold text-slate-800 line-clamp-1">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{agent.phone || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[agent.status]}`}>
                        {STATUS_LABEL[agent.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{agent.featuredRank ?? "—"}</td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <Link
                        href={`/admin/sale-agents/${agent.id}/edit`}
                        className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                      >
                        Sửa
                      </Link>
                      <DeleteButton url={`/api/places/${agent.id}`} confirmText={`Xóa hồ sơ "${agent.name}"?`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display font-bold text-xl text-slate-800 mb-4">Yêu cầu đăng ký chờ duyệt</h2>
        <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
          {applications.length === 0 ? (
            <p className="p-8 text-center text-slate-400">Chưa có yêu cầu đăng ký nào.</p>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-semibold">Người đăng ký</th>
                  <th className="px-5 py-3 font-semibold">SĐT</th>
                  <th className="px-5 py-3 font-semibold">Ngày gửi</th>
                  <th className="px-5 py-3 font-semibold">Hồ sơ</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{a.user.name}</p>
                      <p className="text-xs text-slate-400">{a.user.email}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{a.phone}</td>
                    <td className="px-5 py-3 text-slate-500">{new Date(a.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td className="px-5 py-3">
                      <SaleApplicationViewButton
                        application={{
                          ...a,
                          dob: a.dob.toISOString(),
                          createdAt: a.createdAt.toISOString(),
                        }}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <SaleApplicationStatusControl id={a.id} status={a.status} />
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

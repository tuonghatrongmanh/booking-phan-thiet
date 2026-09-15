import { prisma } from "@/lib/prisma";
import Image from "next/image";
import UserModerationActions from "@/components/admin/UserModerationActions";
import Pagination from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function AdminUsersListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        points: true,
        createdAt: true,
        hidden: true,
        warnedAt: true,
        warningNote: true,
        _count: { select: { forumPosts: true, forumComments: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800">Thành viên</h1>
        <p className="text-slate-400">Quản lý tài khoản khách hàng đã đăng ký ({total} thành viên)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {users.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có thành viên nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Thành viên</th>
                <th className="px-5 py-3 font-semibold">Liên hệ</th>
                <th className="px-5 py-3 font-semibold">Điểm</th>
                <th className="px-5 py-3 font-semibold">Hoạt động</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-100">
                        <Image src={u.avatar} alt="" fill className="object-cover" />
                      </div>
                      <p className="font-semibold text-slate-800">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    <p>{u.email}</p>
                    {u.phone && <p className="text-xs text-slate-400">{u.phone}</p>}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{u.points}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {u._count.forumPosts} bài · {u._count.forumComments} bình luận
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                          u.hidden ? "text-slate-500 bg-slate-100" : "text-brand-green bg-brand-greenBg"
                        }`}
                      >
                        {u.hidden ? "Đã ẩn" : "Hiển thị"}
                      </span>
                      {u.warnedAt && (
                        <span
                          className="text-[11px] font-bold px-2 py-1 rounded-full text-brand-red bg-brand-redBg"
                          title={u.warningNote ?? undefined}
                        >
                          ⚠ Đã cảnh cáo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <UserModerationActions userId={u.id} userName={u.name} hidden={u.hidden} warned={!!u.warnedAt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/users?page=${p}`} />
    </div>
  );
}

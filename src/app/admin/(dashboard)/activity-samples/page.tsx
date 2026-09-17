import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function AdminActivitySamplesListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, items] = await Promise.all([
    prisma.activitySample.count(),
    prisma.activitySample.findMany({ orderBy: { sortOrder: "asc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Hoạt động minh họa</h1>
          <p className="text-slate-400">
            Các mục ví dụ hiện xen kẽ trong widget &quot;hoạt động gần đây&quot; ở góc trái trang chủ, cùng với
            hoạt động thật (đánh giá/trúng xu/đổi quà) — giúp widget luôn sôi động.
          </p>
        </div>
        <Link
          href="/admin/activity-samples/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5 shrink-0"
        >
          + Thêm mục
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {items.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có mục minh họa nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Nội dung</th>
                <th className="px-5 py-3 font-semibold">Thứ tự</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-100">
                        {it.avatar && <Image src={it.avatar} alt="" fill className="object-cover" />}
                      </div>
                      <p className="text-slate-700">
                        <span className="font-bold text-slate-800">{it.name}</span> {it.action}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{it.sortOrder}</td>
                  <td className="px-5 py-3">
                    <ToggleActiveButton url={`/api/activity-samples/${it.id}`} active={it.active} activeLabel="Đang bật" inactiveLabel="Đang tắt" />
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/activity-samples/${it.id}/edit`}
                      className="text-brand-blue hover:bg-sky-50 rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/activity-samples/${it.id}`} confirmText="Xóa mục minh họa này?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/activity-samples?page=${p}`} />
    </div>
  );
}

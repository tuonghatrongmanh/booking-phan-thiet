import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function AdminPopupsListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, popups] = await Promise.all([
    prisma.popup.count(),
    prisma.popup.findMany({ orderBy: { sortOrder: "asc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Pop-up</h1>
          <p className="text-slate-400">
            Ảnh pop-up hiện giữa màn hình khi khách vào website lần đầu (mỗi phiên trình duyệt), có nút đóng.
            Bấm nút trạng thái để bật/tắt nhanh.
          </p>
        </div>
        <Link
          href="/admin/popups/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5 shrink-0"
        >
          + Thêm pop-up
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {popups.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có pop-up nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Pop-up</th>
                <th className="px-5 py-3 font-semibold">Liên kết</th>
                <th className="px-5 py-3 font-semibold">Thứ tự</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {popups.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <Image src={p.image} alt="" fill className="object-cover" />
                      </div>
                      <p className="font-semibold text-slate-800">{p.title || "(không có tiêu đề)"}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{p.href || "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{p.sortOrder}</td>
                  <td className="px-5 py-3">
                    <ToggleActiveButton url={`/api/popups/${p.id}`} active={p.active} activeLabel="Đang bật" inactiveLabel="Đang tắt" />
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/popups/${p.id}/edit`}
                      className="text-brand-blue hover:bg-sky-50 rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/popups/${p.id}`} confirmText="Xóa pop-up này?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/popups?page=${p}`} />
    </div>
  );
}

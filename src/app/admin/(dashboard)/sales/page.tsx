import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

const CATEGORY_LABEL: Record<string, string> = {
  HOMESTAY: "Homestay",
  CAR_RENTAL: "Thuê xe",
  RESTAURANT: "Quán ăn",
  ATTRACTION: "Điểm tham quan",
};

export default async function AdminSalesListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, sales] = await Promise.all([
    prisma.sale.count(),
    prisma.sale.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Ưu đãi</h1>
          <p className="text-slate-400">Quản lý chương trình khuyến mãi hiển thị ở trang chủ</p>
        </div>
        <Link
          href="/admin/sales/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm sale mới
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {sales.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có chương trình sale nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Chương trình</th>
                <th className="px-5 py-3 font-semibold">Danh mục</th>
                <th className="px-5 py-3 font-semibold">SĐT liên hệ</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <Image src={sale.image} alt="" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1">{sale.title}</p>
                        <p className="text-xs text-slate-400">{sale.placeName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{CATEGORY_LABEL[sale.category]}</td>
                  <td className="px-5 py-3 text-slate-500">{sale.phone || "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        sale.active ? "text-brand-green bg-brand-greenBg" : "text-slate-500 bg-slate-100"
                      }`}
                    >
                      {sale.active ? "Đang chạy" : "Đã tắt"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/sales/${sale.id}/edit`}
                      className="text-brand-blue hover:bg-sky-50 rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/sales/${sale.id}`} confirmText="Xóa chương trình sale này?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/sales?page=${p}`} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function AdminReviewsListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, reviews] = await Promise.all([
    prisma.review.count(),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { place: { select: { name: true } }, images: true },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Đánh giá cộng đồng</h1>
          <p className="text-slate-400">Quản lý toàn bộ đánh giá hiển thị ở mục "Đánh giá từ cộng đồng" trang chủ</p>
        </div>
        <Link
          href="/admin/reviews/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm đánh giá
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {reviews.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có đánh giá nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Người đánh giá</th>
                <th className="px-5 py-3 font-semibold">Địa điểm</th>
                <th className="px-5 py-3 font-semibold">Sao</th>
                <th className="px-5 py-3 font-semibold">Nội dung</th>
                <th className="px-5 py-3 font-semibold">Ảnh</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-100">
                        {r.reviewerAvatar ? (
                          <Image src={r.reviewerAvatar} alt="" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                            {r.reviewerName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-slate-800">{r.reviewerName}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{r.place.name}</td>
                  <td className="px-5 py-3 text-brand-gold">{"★".repeat(r.rating)}</td>
                  <td className="px-5 py-3 text-slate-500 max-w-[280px]">
                    <p className="line-clamp-1">{r.content}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{r.images.length}</td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/reviews/${r.id}/edit`}
                      className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/reviews/${r.id}`} confirmText="Xóa đánh giá này?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/reviews?page=${p}`} />
    </div>
  );
}

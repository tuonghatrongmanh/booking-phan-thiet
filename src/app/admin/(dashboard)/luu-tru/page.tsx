import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/components/admin/Pagination";
import StayBannerPanel from "@/components/admin/StayBannerPanel";
import LuuTruPageSettingsForm from "@/components/admin/LuuTruPageSettingsForm";
import { getLuuTruPageSettings } from "@/lib/luu-tru-settings";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

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

export default async function AdminStayPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, stays, aggregates, mostViewed, luuTruSettings] = await Promise.all([
    prisma.place.count({ where: { category: "HOMESTAY" } }),
    prisma.place.findMany({
      where: { category: "HOMESTAY" },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { images: { take: 1 }, reviews: { select: { rating: true } }, _count: { select: { reviews: true } } },
    }),
    prisma.place.aggregate({
      where: { category: "HOMESTAY" },
      _sum: { views: true, totalRooms: true, availableRooms: true },
    }),
    prisma.place.findFirst({
      where: { category: "HOMESTAY" },
      orderBy: { views: "desc" },
      select: { name: true, views: true },
    }),
    getLuuTruPageSettings(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const statCards = [
    { label: "Tổng chỗ lưu trú", value: total.toLocaleString("vi-VN") },
    { label: "Tổng lượt xem", value: (aggregates._sum.views ?? 0).toLocaleString("vi-VN") },
    { label: "Tổng số phòng", value: (aggregates._sum.totalRooms ?? 0).toLocaleString("vi-VN") },
    { label: "Phòng còn trống", value: (aggregates._sum.availableRooms ?? 0).toLocaleString("vi-VN") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Lưu trú</h1>
          <p className="text-slate-400">Quản lý toàn bộ homestay/villa/resort: bài đăng, lượt xem, phòng trống, hình ảnh, bản đồ...</p>
        </div>
        <Link
          href="/admin/places/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5 shrink-0"
        >
          + Đăng homestay mới
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl shadow-card p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{c.label}</p>
            <p className="font-display font-extrabold text-2xl text-slate-800">{c.value}</p>
          </div>
        ))}
      </div>

      {mostViewed && (
        <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3 text-sm">
          <i className="fa-solid fa-fire text-brand-red" aria-hidden="true" />
          <span className="text-slate-500">Xem nhiều nhất:</span>
          <span className="font-bold text-slate-800">{mostViewed.name}</span>
          <span className="text-slate-400">({mostViewed.views.toLocaleString("vi-VN")} lượt xem)</span>
        </div>
      )}

      <StayBannerPanel slot="luu-tru-hero" defaultImage="/images/danhmuc-homestay.png" />

      <LuuTruPageSettingsForm initial={luuTruSettings} />

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {stays.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có homestay nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Homestay</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Lượt xem</th>
                <th className="px-5 py-3 font-semibold">Phòng còn / tổng</th>
                <th className="px-5 py-3 font-semibold">Đánh giá</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {stays.map((s) => {
                const avgRating =
                  s.reviews.length > 0 ? s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length : null;
                return (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          {s.images[0] && <Image src={s.images[0].url} alt="" fill className="object-cover" />}
                        </div>
                        <span className="font-semibold text-slate-800 line-clamp-1">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[s.status]}`}>
                        {STATUS_LABEL[s.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      <i className="fa-regular fa-eye mr-1" aria-hidden="true" /> {s.views.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {s.availableRooms != null || s.totalRooms != null
                        ? `${s.availableRooms ?? "?"} / ${s.totalRooms ?? "?"}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {avgRating != null ? (
                        <>
                          <i className="fa-solid fa-star text-brand-gold mr-1" aria-hidden="true" />
                          {avgRating.toFixed(1)} ({s._count.reviews})
                        </>
                      ) : (
                        "Chưa có"
                      )}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <Link
                        href={`/luu-tru/${s.id}`}
                        target="_blank"
                        className="text-slate-500 hover:bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                      >
                        Xem
                      </Link>
                      <Link
                        href={`/admin/places/${s.id}`}
                        className="text-brand-blue hover:bg-sky-50 rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                      >
                        Quản lý
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/luu-tru?page=${p}`} />
    </div>
  );
}

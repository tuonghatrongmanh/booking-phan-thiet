import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";
import PlaceHideToggle from "@/components/admin/PlaceHideToggle";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  HOMESTAY: "Homestay",
  CAR_RENTAL: "Thuê xe",
  RESTAURANT: "Quán ăn",
  ATTRACTION: "Điểm tham quan",
};

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

const PAGE_SIZE = 5;

export default async function AdminPlacesListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [total, places] = await Promise.all([
    prisma.place.count({ where: { category: { not: "SALE" } } }),
    prisma.place.findMany({
      where: { category: { not: "SALE" } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { images: true, socialComments: true, reviews: true } } },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Địa điểm / Homestay</h1>
          <p className="text-slate-400">Quản lý homestay, thuê xe, quán ăn, điểm tham quan, fanpage</p>
        </div>
        <Link
          href="/admin/places/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm địa điểm
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {places.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có địa điểm nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Tên</th>
                <th className="px-5 py-3 font-semibold">Danh mục</th>
                <th className="px-5 py-3 font-semibold">SĐT</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Ảnh / Bằng chứng / Đánh giá</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {places.map((place) => (
                <tr key={place.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-100">
                        {place.avatar ? (
                          <Image src={place.avatar} alt="" fill className="object-cover" />
                        ) : null}
                      </div>
                      <span className="font-semibold text-slate-800 line-clamp-1">{place.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{CATEGORY_LABEL[place.category]}</td>
                  <td className="px-5 py-3 text-slate-500">{place.phone || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[place.status]}`}>
                      {STATUS_LABEL[place.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {place._count.images} ảnh · {place._count.socialComments} bằng chứng MXH · {place._count.reviews} đánh giá
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/places/${place.id}`}
                      className="text-brand-blue hover:bg-sky-50 rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Quản lý
                    </Link>
                    <PlaceHideToggle id={place.id} hidden={place.hidden} />
                    <DeleteButton url={`/api/places/${place.id}`} confirmText="Xóa địa điểm này và toàn bộ dữ liệu liên quan?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => `/admin/places?page=${p}`} />
    </div>
  );
}

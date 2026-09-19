import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import PlaceHideToggle from "@/components/admin/PlaceHideToggle";

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

export default async function AdminAttractionsPage() {
  const attractions = await prisma.place.findMany({
    where: { category: "ATTRACTION" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reviews: true, placeReviews: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Trải nghiệm / Điểm tham quan</h1>
          <p className="text-slate-400">Quản lý các địa điểm tham quan hiển thị ở trang chủ và /diem-tham-quan</p>
        </div>
        <Link
          href="/admin/attractions/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5 shrink-0"
        >
          + Thêm địa điểm
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {attractions.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có địa điểm tham quan nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Tên</th>
                <th className="px-5 py-3 font-semibold">Địa chỉ</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Đánh giá</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {attractions.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        {a.avatar ? <Image src={a.avatar} alt="" fill className="object-cover" /> : null}
                      </div>
                      <span className="font-semibold text-slate-800 line-clamp-1">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 line-clamp-1">{a.address || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[a.status]}`}>
                      {STATUS_LABEL[a.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{a._count.reviews + a._count.placeReviews}</td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/diem-tham-quan/${a.id}`}
                      target="_blank"
                      className="text-slate-500 hover:bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Xem
                    </Link>
                    <Link
                      href={`/admin/attractions/${a.id}/edit`}
                      className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <PlaceHideToggle id={a.id} hidden={a.hidden} />
                    <DeleteButton url={`/api/places/${a.id}`} confirmText={`Xóa địa điểm "${a.name}"?`} />
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

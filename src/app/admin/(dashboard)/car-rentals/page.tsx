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

export default async function AdminCarRentalsPage() {
  const vehicles = await prisma.place.findMany({
    where: { category: "CAR_RENTAL" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reviews: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Thuê xe</h1>
          <p className="text-slate-400">Quản lý các xe cho thuê hiển thị ở trang /thue-xe</p>
        </div>
        <Link
          href="/admin/car-rentals/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5 shrink-0"
        >
          + Thêm xe
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {vehicles.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có xe cho thuê nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Xe</th>
                <th className="px-5 py-3 font-semibold">Loại xe</th>
                <th className="px-5 py-3 font-semibold">Giá / ngày</th>
                <th className="px-5 py-3 font-semibold">Còn / Tổng</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        {v.avatar ? <Image src={v.avatar} alt="" fill className="object-cover" /> : null}
                      </div>
                      <span className="font-semibold text-slate-800 line-clamp-1">{v.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{v.vehicleType || "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{v.priceFromVnd ? `${v.priceFromVnd.toLocaleString("vi-VN")}đ` : "—"}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {v.availableRooms ?? "?"} / {v.totalRooms ?? "?"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[v.status]}`}>
                      {STATUS_LABEL[v.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/car-rentals/${v.id}/edit`}
                      className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <PlaceHideToggle id={v.id} hidden={v.hidden} />
                    <DeleteButton url={`/api/places/${v.id}`} confirmText={`Xóa xe "${v.name}"?`} />
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

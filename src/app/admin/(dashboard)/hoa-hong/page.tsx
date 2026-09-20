import { prisma } from "@/lib/prisma";
import { getCommissionPercent } from "@/lib/referral";
import { vnd, vnDay } from "@/lib/booking-report";
import { PayButton, RateForm, SaleRateControl } from "@/components/admin/CommissionControls";
import { addDays } from "@/lib/booking-report";

export const dynamic = "force-dynamic";

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

const STATUS = { PENDING: ["Chờ trả", "bg-amber-100 text-amber-700"], PAID: ["Đã trả", "bg-emerald-100 text-emerald-700"], CANCELLED: ["Đơn đã hủy", "bg-slate-100 text-slate-500"] } as const;

export default async function CommissionsPage() {
  const from30 = addDays(vnDay(new Date()), -29);
  const [percent, rows, bySale, sales, visitAgg, orderAgg] = await Promise.all([
    getCommissionPercent(),
    prisma.saleCommission.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { sale: { select: { id: true, name: true, phone: true } } } }),
    prisma.saleCommission.groupBy({ by: ["salePlaceId"], where: { status: "PENDING" }, _sum: { amount: true }, _count: true }),
    prisma.place.findMany({ where: { category: "SALE" }, select: { id: true, name: true, referralCode: true, commissionPercent: true, hidden: true }, orderBy: { name: "asc" }, take: 200 }),
    prisma.referralVisit.groupBy({ by: ["salePlaceId"], where: { day: { gte: from30 } }, _sum: { visits: true } }),
    prisma.saleCommission.groupBy({ by: ["salePlaceId"], where: { status: { not: "CANCELLED" }, createdAt: { gte: daysAgo(30) } }, _count: true }),
  ]);
  const visitsOf = new Map(visitAgg.map((v) => [v.salePlaceId, v._sum.visits ?? 0]));
  const ordersOf = new Map(orderAgg.map((o) => [o.salePlaceId, o._count]));
  const saleRows = [...sales].sort((a, b) => (visitsOf.get(b.id) ?? 0) - (visitsOf.get(a.id) ?? 0) || a.name.localeCompare(b.name));

  const stayIds = rows.filter((r) => r.kind === "stay").map((r) => r.inquiryId);
  const rentalIds = rows.filter((r) => r.kind === "rental").map((r) => r.inquiryId);
  const [stays, rentals, saleNames] = await Promise.all([
    prisma.stayBookingInquiry.findMany({ where: { id: { in: stayIds } }, select: { id: true, customerName: true, place: { select: { name: true } } } }),
    prisma.rentalInquiry.findMany({ where: { id: { in: rentalIds } }, select: { id: true, customerName: true, place: { select: { name: true } } } }),
    prisma.place.findMany({ where: { id: { in: bySale.map((b) => b.salePlaceId) } }, select: { id: true, name: true, phone: true } }),
  ]);
  const info = new Map<string, { who: string; place: string }>();
  for (const s of stays) info.set(`stay:${s.id}`, { who: s.customerName, place: s.place.name });
  for (const r of rentals) info.set(`rental:${r.id}`, { who: r.customerName, place: r.place.name });
  const totalPending = bySale.reduce((n, b) => n + (b._sum.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Hoa hồng Sale giới thiệu</h1>
        <p className="text-slate-400">Khách vào bằng link có mã của Sale và đặt cọc thành công (bạn bấm xác nhận đã nhận cọc) thì hệ thống ghi hoa hồng cho Sale. Bạn chuyển khoản cho Sale ngoài hệ thống rồi bấm &ldquo;Đã trả&rdquo; để ghi sổ.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-5">
        <RateForm initial={percent} />
        <p className="text-xs text-slate-400 mt-3">Đổi tỉ lệ chỉ áp dụng cho các đơn được xác nhận cọc từ bây giờ. Hoa hồng đã ghi giữ nguyên tỉ lệ lúc ghi. Sale bị cấm/đình chỉ không nhận hoa hồng mới.</p>
      </div>

      <section className="bg-white rounded-2xl shadow-card overflow-x-auto">
        <h2 className="font-display font-bold text-lg text-slate-800 p-5 pb-1">Theo từng Sale</h2>
        <p className="px-5 pb-3 text-xs text-slate-400">Ô tỉ lệ để trống = dùng mức chung ({percent}%). Đặt riêng để thưởng thêm cho Sale giỏi hoặc ưu đãi đối tác lớn. Lượt bấm tính 1 lần/ngày/thiết bị, 30 ngày gần nhất.</p>
        {saleRows.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-slate-400">Chưa có Sale nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Sale</th>
                <th className="px-3 py-2.5 font-semibold text-right">Lượt bấm (30 ngày)</th>
                <th className="px-3 py-2.5 font-semibold text-right">Đơn đã cọc (30 ngày)</th>
                <th className="px-3 py-2.5 font-semibold text-right">Chốt</th>
                <th className="px-5 py-2.5 font-semibold">Hoa hồng %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {saleRows.map((s) => {
                const v = visitsOf.get(s.id) ?? 0;
                const o = ordersOf.get(s.id) ?? 0;
                return (
                  <tr key={s.id}>
                    <td className="px-5 py-2.5"><span className="font-semibold text-slate-700">{s.name}</span>{s.hidden && <span className="text-xs text-slate-400"> · đang ẩn</span>}<span className="block text-[11px] font-mono text-slate-400">{s.referralCode ?? "chưa có mã"}</span></td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{v}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{o}</td>
                    <td className="px-3 py-2.5 text-right text-slate-500">{v > 0 ? `${Math.min(100, Math.round((o / v) * 100))}%` : "—"}</td>
                    <td className="px-5 py-2.5"><SaleRateControl saleId={s.id} custom={s.commissionPercent} globalPercent={percent} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="font-display font-bold text-lg text-slate-800">Cần trả cho Sale</h2>
          <p className="text-sm font-bold text-slate-600">Tổng: {vnd(totalPending)}</p>
        </div>
        {bySale.length === 0 ? (
          <p className="text-sm text-slate-400">Không có hoa hồng nào đang chờ trả.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {bySale.map((b) => {
              const s = saleNames.find((n) => n.id === b.salePlaceId);
              return (
                <li key={b.salePlaceId} className="py-3 flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-semibold text-slate-700">{s?.name ?? "Sale"}</p>
                    <p className="text-xs text-slate-400">{s?.phone ?? "chưa có SĐT"} · {b._count} đơn</p>
                  </div>
                  <p className="font-bold text-slate-800">{vnd(b._sum.amount ?? 0)}</p>
                  <PayButton salePlaceId={b.salePlaceId} label="Đã trả hết" message={`Xác nhận bạn đã chuyển ${vnd(b._sum.amount ?? 0)} cho ${s?.name ?? "Sale"}? Hệ thống sẽ ghi sổ ${b._count} hoa hồng là đã trả.`} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-card overflow-x-auto">
        <h2 className="font-display font-bold text-lg text-slate-800 p-5 pb-3">Lịch sử hoa hồng (100 gần nhất)</h2>
        {rows.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-slate-400">Chưa có hoa hồng nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Ngày</th>
                <th className="px-3 py-2.5 font-semibold">Sale</th>
                <th className="px-3 py-2.5 font-semibold">Đơn</th>
                <th className="px-3 py-2.5 font-semibold text-right">Tiền cọc</th>
                <th className="px-3 py-2.5 font-semibold text-right">Hoa hồng</th>
                <th className="px-3 py-2.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const i = info.get(`${r.kind}:${r.inquiryId}`);
                return (
                  <tr key={r.id}>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-500">{vnDay(r.createdAt).split("-").reverse().join("/")}</td>
                    <td className="px-3 py-3 font-semibold text-slate-700">{r.sale.name}</td>
                    <td className="px-3 py-3 text-slate-600"><span className="block">{i?.place ?? "—"}</span><span className="text-xs text-slate-400">{i?.who ?? ""} · {r.kind === "stay" ? "đặt phòng" : "thuê xe"}</span></td>
                    <td className="px-3 py-3 text-right text-slate-600">{vnd(r.depositAmount)}</td>
                    <td className="px-3 py-3 text-right font-bold text-slate-800">{vnd(r.amount)} <span className="text-xs font-normal text-slate-400">({r.ratePercent}%)</span></td>
                    <td className="px-3 py-3"><span className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${STATUS[r.status][1]}`}>{STATUS[r.status][0]}</span>{r.paidAt && <span className="block text-[11px] text-slate-400 mt-0.5">{vnDay(r.paidAt).split("-").reverse().join("/")}</span>}</td>
                    <td className="px-5 py-3 text-right">{r.status === "PENDING" && <PayButton ids={[r.id]} label="Đã trả" message={`Xác nhận đã trả ${vnd(r.amount)} cho ${r.sale.name}?`} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveDateRange, type DateRangeParams } from "@/lib/admin-date-range";
import { buildRevenueSeries, vnd, vnDay } from "@/lib/booking-report";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = { PENDING: "Mới", CONTACTED: "Đã liên hệ", DONE: "Hoàn tất", CANCELLED: "Đã hủy" };

function Kpi({ label, value, prev, icon, money = false, suffix = "" }: { label: string; value: number; prev?: number; icon: string; money?: boolean; suffix?: string }) {
  const diff = prev === undefined ? null : value - prev;
  const pct = prev === undefined ? null : prev === 0 ? (value === 0 ? 0 : 100) : Math.round((Math.abs(value - prev) / prev) * 100);
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 min-w-0">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-9 h-9 rounded-xl bg-brand-tint text-brand-blue flex items-center justify-center shrink-0">
          <i className={icon} aria-hidden="true" />
        </span>
        <p className="text-[13px] font-semibold text-slate-500">{label}</p>
      </div>
      <p className="font-display font-extrabold text-2xl sm:text-3xl text-slate-800 break-words">{money ? vnd(value) : `${value.toLocaleString("vi-VN")}${suffix}`}</p>
      {diff !== null && (
        <p className={`text-xs font-semibold mt-2 ${diff === 0 ? "text-slate-400" : diff > 0 ? "text-brand-green" : "text-brand-red"}`}>
          {diff === 0 ? "Không đổi so với kỳ trước" : `${diff > 0 ? "▲ +" : "▼ -"}${pct}% so với kỳ trước`}
        </p>
      )}
    </div>
  );
}

export default async function ReportPage({ searchParams }: { searchParams: Promise<DateRangeParams> }) {
  const sp = await searchParams;
  if (!sp.range) redirect("/admin/bao-cao?range=30d");
  const { start, end, previousStart, previousEnd, label } = resolveDateRange(sp);

  const inRange = { gte: start, lte: end };
  const inPrev = { gte: previousStart, lte: previousEnd };
  const [stayCreated, stayCreatedPrev, rentalCreated, rentalCreatedPrev, stayPaid, rentalPaid, stayPaidPrev, rentalPaidPrev, stayStatus, rentalStatus, waitingStay, waitingRental] = await Promise.all([
    prisma.stayBookingInquiry.count({ where: { createdAt: inRange } }),
    prisma.stayBookingInquiry.count({ where: { createdAt: inPrev } }),
    prisma.rentalInquiry.count({ where: { createdAt: inRange } }),
    prisma.rentalInquiry.count({ where: { createdAt: inPrev } }),
    prisma.stayBookingInquiry.findMany({ where: { depositStatus: "PAID", depositPaidAt: inRange }, select: { depositAmount: true, depositPaidAt: true, place: { select: { id: true, name: true } } }, take: 5000 }),
    prisma.rentalInquiry.findMany({ where: { depositStatus: "PAID", depositPaidAt: inRange }, select: { depositAmount: true, depositPaidAt: true, place: { select: { id: true, name: true } } }, take: 5000 }),
    prisma.stayBookingInquiry.aggregate({ where: { depositStatus: "PAID", depositPaidAt: inPrev }, _sum: { depositAmount: true } }),
    prisma.rentalInquiry.aggregate({ where: { depositStatus: "PAID", depositPaidAt: inPrev }, _sum: { depositAmount: true } }),
    prisma.stayBookingInquiry.groupBy({ by: ["status"], where: { createdAt: inRange }, _count: true }),
    prisma.rentalInquiry.groupBy({ by: ["status"], where: { createdAt: inRange }, _count: true }),
    prisma.stayBookingInquiry.count({ where: { depositStatus: "PENDING", customerReportedPaidAt: { not: null } } }),
    prisma.rentalInquiry.count({ where: { depositStatus: "PENDING", customerReportedPaidAt: { not: null } } }),
  ]);

  const sum = (rows: { depositAmount: number | null }[]) => rows.reduce((s, r) => s + (r.depositAmount ?? 0), 0);
  const stayRevenue = sum(stayPaid);
  const rentalRevenue = sum(rentalPaid);
  const revenue = stayRevenue + rentalRevenue;
  const revenuePrev = (stayPaidPrev._sum.depositAmount ?? 0) + (rentalPaidPrev._sum.depositAmount ?? 0);
  const created = stayCreated + rentalCreated;
  const paidCount = stayPaid.length + rentalPaid.length;
  const conversion = created === 0 ? 0 : Math.min(100, Math.round((paidCount / created) * 100));

  const series = buildRevenueSeries(
    stayPaid.map((r) => ({ paidAt: r.depositPaidAt, amount: r.depositAmount })),
    rentalPaid.map((r) => ({ paidAt: r.depositPaidAt, amount: r.depositAmount })),
    vnDay(start),
    vnDay(end)
  );
  const maxBar = Math.max(1, ...series.map((p) => p.stay + p.rental));
  const labelEvery = Math.ceil(series.length / 12);

  const top = (rows: typeof stayPaid) => {
    const m = new Map<string, { name: string; amount: number; count: number }>();
    for (const r of rows) {
      const cur = m.get(r.place.id) ?? { name: r.place.name, amount: 0, count: 0 };
      cur.amount += r.depositAmount ?? 0;
      cur.count += 1;
      m.set(r.place.id, cur);
    }
    return [...m.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);
  };
  const qs = new URLSearchParams(Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]).toString();
  const statusCount = (rows: { status: string; _count: number }[], k: string) => rows.find((r) => r.status === k)?._count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Báo cáo &amp; doanh thu</h1>
          <p className="text-slate-400">Tiền cọc đã nhận và số đơn đặt phòng, thuê xe - kỳ: <b className="text-slate-600">{label}</b> (đổi kỳ ở ô lọc phía trên)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/admin/reports/export?type=stay&${qs}`} className="text-sm font-bold text-brand-blue border border-brand-blueMid rounded-full px-4 py-2 hover:bg-brand-tint">
            <i className="fa-solid fa-file-csv mr-1.5" aria-hidden="true" />Xuất CSV đặt phòng
          </a>
          <a href={`/api/admin/reports/export?type=rental&${qs}`} className="text-sm font-bold text-brand-blue border border-brand-blueMid rounded-full px-4 py-2 hover:bg-brand-tint">
            <i className="fa-solid fa-file-csv mr-1.5" aria-hidden="true" />Xuất CSV thuê xe
          </a>
        </div>
      </div>

      {waitingStay + waitingRental > 0 && (
        <Link href={waitingStay > 0 ? "/admin/stay-booking-inquiries" : "/admin/rental-inquiries"} className="block bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-3 text-sm font-semibold">
          <i className="fa-solid fa-bell mr-2" aria-hidden="true" />
          Có {waitingStay + waitingRental} đơn khách báo đã chuyển khoản, chờ bạn kiểm tra và xác nhận cọc →
        </Link>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi label="Tiền cọc đã nhận" value={revenue} prev={revenuePrev} icon="fa-solid fa-sack-dollar" money />
        <Kpi label="Đơn đặt phòng mới" value={stayCreated} prev={stayCreatedPrev} icon="fa-solid fa-bed" />
        <Kpi label="Đơn thuê xe mới" value={rentalCreated} prev={rentalCreatedPrev} icon="fa-solid fa-motorcycle" />
        <Kpi label="Tỉ lệ đơn đã cọc" value={conversion} icon="fa-solid fa-percent" suffix="%" />
      </div>

      <section className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="font-display font-bold text-lg text-slate-800">Tiền cọc nhận được theo {series.length > 0 && series[0].key.length === 7 ? "tháng" : "ngày"}</h2>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm bg-brand-blue inline-block" /> Đặt phòng: {vnd(stayRevenue)}</span>
            <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Thuê xe: {vnd(rentalRevenue)}</span>
          </div>
        </div>
        {revenue === 0 ? (
          <p className="text-center text-slate-400 py-10">Chưa có khoản cọc nào được xác nhận trong kỳ này.</p>
        ) : (
          <div className="overflow-x-auto overflow-y-hidden pb-1">
            <div className="flex items-end gap-1 h-48 min-w-[480px]">
              {series.map((p, i) => {
                const total = p.stay + p.rental;
                return (
                  <div key={p.key} className="flex-1 min-w-0 flex flex-col items-center justify-end h-full" title={`${p.label}: ${vnd(total)} (phòng ${vnd(p.stay)}, xe ${vnd(p.rental)})`}>
                    <div className="w-full max-w-[28px] flex flex-col justify-end rounded-t-md overflow-hidden" style={{ height: `${Math.max(total > 0 ? 3 : 0, (total / maxBar) * 100)}%` }}>
                      <div className="bg-amber-400" style={{ height: `${total ? (p.rental / total) * 100 : 0}%` }} />
                      <div className="bg-brand-blue flex-1" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 h-3">{i % labelEvery === 0 ? p.label : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-5">
        {([
          ["Homestay được cọc nhiều nhất", top(stayPaid)],
          ["Xe được cọc nhiều nhất", top(rentalPaid)],
        ] as const).map(([title, rows]) => (
          <section key={title} className="bg-white rounded-2xl shadow-card p-5 min-w-0">
            <h2 className="font-display font-bold text-lg text-slate-800 mb-3">{title}</h2>
            {rows.length === 0 ? (
              <p className="text-sm text-slate-400">Chưa có dữ liệu trong kỳ này.</p>
            ) : (
              <ol className="space-y-2">
                {rows.map((r, i) => (
                  <li key={r.name} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-brand-tint text-brand-blue font-bold text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="flex-1 min-w-0 truncate font-semibold text-slate-700">{r.name}</span>
                    <span className="text-slate-400 text-xs shrink-0">{r.count} đơn</span>
                    <span className="font-bold text-slate-800 shrink-0">{vnd(r.amount)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>

      <section className="bg-white rounded-2xl shadow-card p-5">
        <h2 className="font-display font-bold text-lg text-slate-800 mb-3">Tình trạng xử lý đơn trong kỳ</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead className="text-slate-500 text-left">
              <tr>
                <th className="py-2 font-semibold">Loại đơn</th>
                {Object.values(STATUS_LABEL).map((l) => (
                  <th key={l} className="py-2 font-semibold text-right">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {([
                ["Đặt phòng", stayStatus],
                ["Thuê xe", rentalStatus],
              ] as const).map(([name, rows]) => (
                <tr key={name}>
                  <td className="py-2.5 font-semibold text-slate-700">{name}</td>
                  {Object.keys(STATUS_LABEL).map((k) => (
                    <td key={k} className="py-2.5 text-right text-slate-600">{statusCount(rows, k)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

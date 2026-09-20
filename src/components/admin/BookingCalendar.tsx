import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { daysBetween, occupancyForMonth, vnDay } from "@/lib/booking-report";

const WEEKDAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const DAY_MS = 86400000;

const shiftMonth = (key: string, delta: number) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
};

// Lưới lịch theo tháng cho homestay / xe. Dùng chung cho trang admin và Cổng đối tác (placeIds giới hạn chỉ các chỗ của đối tác).
export default async function BookingCalendar({
  basePath,
  type,
  monthParam,
  placeIds,
  allowedTypes,
}: {
  basePath: string;
  type: "stay" | "car";
  monthParam?: string;
  placeIds?: string[];
  allowedTypes: ("stay" | "car")[];
}) {

  const today = vnDay(new Date());
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam ?? "") ? (monthParam as string) : today.slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const days = daysBetween(`${month}-01`, `${month}-${String(lastDay).padStart(2, "0")}`);
  const from = new Date(`${month}-01T00:00:00+07:00`);
  const to = new Date(from.getTime() + lastDay * DAY_MS);
  const margin = DAY_MS; // dư 1 ngày mỗi đầu; lọc chính xác ở occupancyForMonth

  const places = await prisma.place.findMany({
    where: { category: type === "stay" ? "HOMESTAY" : "CAR_RENTAL", ...(placeIds ? { id: { in: placeIds } } : {}) },
    select: { id: true, name: true, totalRooms: true, hidden: true },
    orderBy: { name: "asc" },
  });
  const ids = places.map((p) => p.id);

  type Row = { placeId: string; start: Date; end: Date; quantity: number; who: string; paid: boolean };
  let rows: Row[];
  if (type === "stay") {
    const list = await prisma.stayBookingInquiry.findMany({
      where: { placeId: { in: ids }, status: { not: "CANCELLED" }, depositStatus: { in: ["PAID", "PENDING"] }, checkinDate: { lt: new Date(to.getTime() + margin) }, checkoutDate: { gt: new Date(from.getTime() - margin) } },
      select: { placeId: true, checkinDate: true, checkoutDate: true, quantity: true, optionWhole: true, customerName: true, depositStatus: true },
    });
    const total = new Map(places.map((p) => [p.id, Math.max(1, p.totalRooms ?? 1)]));
    rows = list.map((r) => ({ placeId: r.placeId, start: r.checkinDate, end: r.checkoutDate, quantity: r.optionWhole ? total.get(r.placeId)! : r.quantity, who: r.customerName, paid: r.depositStatus === "PAID" }));
  } else {
    const list = await prisma.rentalInquiry.findMany({
      where: { placeId: { in: ids }, status: { not: "CANCELLED" }, depositStatus: { in: ["PAID", "PENDING"] }, pickupDate: { lt: new Date(to.getTime() + margin) }, returnDate: { gt: new Date(from.getTime() - margin) } },
      select: { placeId: true, pickupDate: true, returnDate: true, quantity: true, customerName: true, depositStatus: true },
    });
    rows = list.map((r) => ({ placeId: r.placeId, start: r.pickupDate, end: r.returnDate, quantity: r.quantity, who: r.customerName, paid: r.depositStatus === "PAID" }));
  }

  const grid = places.map((p) => {
    const mine = rows.filter((r) => r.placeId === p.id);
    const paid = occupancyForMonth(mine.filter((r) => r.paid), days, type);
    const pending = occupancyForMonth(mine.filter((r) => !r.paid), days, type);
    const names = days.map((d) =>
      mine
        .filter((r) => (type === "stay" ? vnDay(r.start) <= d && d < vnDay(r.end) : vnDay(r.start) <= d && d <= vnDay(r.end)))
        .map((r) => `${r.who}${r.paid ? "" : " (chờ cọc)"}`)
        .join(", ")
    );
    return { place: p, paid, pending, names };
  });
  const unit = type === "stay" ? "phòng" : "xe";
  const tab = (t: "stay" | "car", label: string) => (
    <Link href={`${basePath}?type=${t}&month=${month}`} className={`px-4 py-2 rounded-full text-sm font-bold ${type === t ? "bg-brand-blue text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
      {label}
    </Link>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Lịch đặt {type === "stay" ? "phòng" : "xe"}</h1>
        <p className="text-slate-400">Xem ngày nào đã có khách giữ chỗ. Ô xanh = đã nhận cọc (chiếm chỗ thật), ô vàng = khách mới gửi đơn, chưa cọc.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {allowedTypes.includes("stay") && tab("stay", "Homestay")}
        {allowedTypes.includes("car") && tab("car", "Thuê xe")}
        <div className="ml-auto flex items-center gap-2">
          <Link href={`${basePath}?type=${type}&month=${shiftMonth(month, -1)}`} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50" aria-label="Tháng trước">
            <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
          </Link>
          <span className="font-display font-bold text-slate-800 min-w-[110px] text-center">Tháng {String(m).padStart(2, "0")}/{y}</span>
          <Link href={`${basePath}?type=${type}&month=${shiftMonth(month, 1)}`} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50" aria-label="Tháng sau">
            <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
          </Link>
          {month !== today.slice(0, 7) && (
            <Link href={`${basePath}?type=${type}`} className="text-sm font-semibold text-brand-blue hover:underline ml-1">Hôm nay</Link>
          )}
        </div>
      </div>

      {places.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-400">Chưa có {type === "stay" ? "homestay" : "xe"} nào.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
          <table className="border-separate border-spacing-0 text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white text-left px-4 py-2 min-w-[170px] font-semibold text-slate-500 border-b border-slate-100">{type === "stay" ? "Homestay" : "Xe"}</th>
                {days.map((d) => {
                  const wd = new Date(`${d}T12:00:00Z`).getUTCDay();
                  return (
                    <th key={d} className={`px-0 py-1.5 w-9 min-w-9 text-center font-semibold border-b border-slate-100 ${d === today ? "text-brand-blue" : wd === 0 || wd === 6 ? "text-brand-red/80" : "text-slate-500"}`}>
                      <div className="text-[10px] font-medium">{WEEKDAY[wd]}</div>
                      <div className={d === today ? "bg-brand-blue text-white rounded-full w-6 h-6 mx-auto flex items-center justify-center" : ""}>{d.slice(8)}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {grid.map(({ place, paid, pending, names }) => (
                <tr key={place.id}>
                  <td className="sticky left-0 z-10 bg-white px-4 py-2 border-b border-slate-50 font-semibold text-slate-700">
                    <span className="block max-w-[200px] truncate">{place.name}</span>
                    <span className="text-[11px] font-normal text-slate-400">{place.totalRooms ? `${place.totalRooms} ${unit}` : `chưa nhập số ${unit}`}{place.hidden ? " · đang ẩn" : ""}</span>
                  </td>
                  {days.map((d, i) => {
                    const full = place.totalRooms ? paid[i] >= place.totalRooms : false;
                    const cls = paid[i] > 0 ? (full ? "bg-brand-red text-white" : "bg-brand-blue text-white") : pending[i] > 0 ? "bg-amber-100 text-amber-700" : d === today ? "bg-brand-tint" : "";
                    return (
                      <td key={d} title={names[i] || undefined} className={`h-10 text-center font-bold border-b border-l border-slate-50 ${cls}`}>
                        {paid[i] > 0 ? paid[i] : pending[i] > 0 ? pending[i] : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5"><i className="w-4 h-4 rounded bg-brand-blue inline-block" /> Đã nhận cọc (số {unit} bị giữ)</span>
        <span className="flex items-center gap-1.5"><i className="w-4 h-4 rounded bg-brand-red inline-block" /> Hết {unit} trong ngày</span>
        <span className="flex items-center gap-1.5"><i className="w-4 h-4 rounded bg-amber-100 border border-amber-200 inline-block" /> Chờ cọc (chưa chiếm chỗ)</span>
        <span>Rê chuột (hoặc chạm giữ) vào ô để xem tên khách.</span>
      </div>
    </div>
  );
}

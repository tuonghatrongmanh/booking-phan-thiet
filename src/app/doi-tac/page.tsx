import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { prisma } from "@/lib/prisma";
import { getPartnerContext } from "@/lib/partner";
import { addDays, canMarkArrived, vnDay } from "@/lib/booking-report";
import PartnerOrderActions from "@/components/partner/PartnerOrderActions";

export const metadata = { title: "Cổng đối tác | Booking Phan Thiết", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = { PENDING: "Mới", CONTACTED: "Đã liên hệ", DONE: "Hoàn tất", CANCELLED: "Đã hủy" };
const DEPOSIT: Record<string, [string, string]> = { NONE: ["Không cọc", "bg-slate-100 text-slate-500"], PENDING: ["Chờ cọc", "bg-amber-100 text-amber-700"], PAID: ["Đã nhận cọc", "bg-emerald-100 text-emerald-700"] };
const REQ_STATUS: Record<string, [string, string]> = { PENDING: ["Chờ admin duyệt", "bg-amber-100 text-amber-700"], APPROVED: ["Đã duyệt", "bg-emerald-100 text-emerald-700"], REJECTED: ["Bị từ chối", "bg-red-100 text-red-600"] };
const d = (x: Date) => vnDay(x).split("-").reverse().join("/");
const vnd = (n: number | null) => (n ? `${n.toLocaleString("vi-VN")}đ` : "—");

export default async function PartnerPage() {
  const ctx = await getPartnerContext();
  if (!ctx) redirect("/dang-nhap?callbackUrl=/doi-tac");

  if (ctx.places.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <Header />
        <main className="max-w-[560px] mx-auto px-4 py-16 text-center">
          <i className="fa-solid fa-handshake text-4xl text-brand-blue mb-4" aria-hidden="true" />
          <h1 className="font-display font-extrabold text-2xl text-slate-800 mb-2">Cổng đối tác</h1>
          <p className="text-slate-500">Tài khoản của bạn chưa được gán quản lý homestay hay xe nào. Vui lòng liên hệ Booking Phan Thiết để được kích hoạt.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const ids = ctx.places.map((p) => p.id);
  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 86400000);
  const monthStart = new Date(`${vnDay(now).slice(0, 7)}-01T00:00:00+07:00`);
  const [stay, rental, requests] = await Promise.all([
    prisma.stayBookingInquiry.findMany({ where: { placeId: { in: ids } }, orderBy: { createdAt: "desc" }, take: 40, include: { place: { select: { name: true } } } }),
    prisma.rentalInquiry.findMany({ where: { placeId: { in: ids } }, orderBy: { createdAt: "desc" }, take: 40, include: { place: { select: { name: true } } } }),
    prisma.placeChangeRequest.findMany({ where: { placeId: { in: ids } }, orderBy: { createdAt: "desc" }, take: 10, include: { place: { select: { name: true } } } }),
  ]);

  const orders = [
    ...stay.map((r) => ({ id: r.id, kindKey: "stay" as const, arrivedAt: r.arrivedAt, kind: "Đặt phòng", placeName: r.place.name, customer: r.customerName, phone: r.customerPhone, from: r.checkinDate, to: r.checkoutDate, qty: r.quantity, label: r.optionLabel, status: r.status, deposit: r.depositStatus, created: r.createdAt })),
    ...rental.map((r) => ({ id: r.id, kindKey: "rental" as const, arrivedAt: r.arrivedAt, kind: "Thuê xe", placeName: r.place.name, customer: r.customerName, phone: r.customerPhone, from: r.pickupDate, to: r.returnDate, qty: r.quantity, label: null as string | null, status: r.status, deposit: r.depositStatus, created: r.createdAt })),
  ].sort((a, b) => b.created.getTime() - a.created.getTime()).slice(0, 40);

  const thisMonth = orders.filter((o) => o.created >= monthStart && o.status !== "CANCELLED").length;
  const paid = orders.filter((o) => o.deposit === "PAID" && o.status !== "CANCELLED");
  const arrivedCount = orders.filter((o) => o.arrivedAt).length;
  const upcoming = paid.filter((o) => o.from >= new Date(now.getTime() - 86400000) && o.from <= soon).length;
  const hasCar = ctx.places.some((p) => p.category === "CAR_RENTAL");

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <main className="max-w-[980px] mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-slate-800">Cổng đối tác</h1>
            <p className="text-slate-500 text-sm">Xem đơn và lịch của {hasCar ? "homestay / xe" : "homestay"} bạn quản lý. Tiền cọc do Booking Phan Thiết nhận và xác nhận.</p>
          </div>
          <Link href="/doi-tac/lich" className="bg-brand-blue text-white font-bold rounded-full px-5 py-2.5 text-sm hover:brightness-95">
            <i className="fa-regular fa-calendar-days mr-2" aria-hidden="true" />Xem lịch đặt
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([["Đơn mới tháng này", thisMonth], ["Đã nhận cọc", paid.length], ["Khách đến trong 7 ngày", upcoming], ["Khách đã đến", arrivedCount]] as const).map(([label, value]) => (
            <div key={label} className="bg-white rounded-2xl shadow-card p-4">
              <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
              <p className="font-display font-extrabold text-2xl text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="font-display font-bold text-lg text-slate-800 mb-3">Chỗ của tôi</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {ctx.places.map((p) => {
              const pending = requests.find((r) => r.placeId === p.id && r.status === "PENDING");
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-card p-4 flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.avatar ? <img src={p.avatar} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" /> : <div className="w-20 h-20 rounded-xl bg-brand-tint shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.category === "HOMESTAY" ? "Homestay" : "Xe thuê"} · giá từ {vnd(p.priceFromVnd)}{p.hidden ? " · đang ẩn" : ""}</p>
                    {pending ? <span className={`inline-block mt-2 text-[11px] font-bold rounded-full px-2 py-0.5 ${REQ_STATUS.PENDING[1]}`}>Có yêu cầu sửa đang chờ duyệt</span> : (
                      <Link href={`/doi-tac/sua/${p.id}`} className="inline-block mt-2 text-sm font-bold text-brand-blue hover:underline">Gửi yêu cầu chỉnh sửa →</Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-slate-800 mb-3">Đơn gần đây</h2>
          {orders.length === 0 ? (
            <p className="bg-white rounded-2xl shadow-card p-6 text-sm text-slate-400 text-center">Chưa có đơn nào.</p>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o.kind + o.id} className="bg-white rounded-2xl shadow-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800">{o.customer} <span className="text-xs font-semibold text-slate-400">· {o.kind}</span></p>
                      <p className="text-sm text-slate-600 truncate">{o.placeName}{o.label ? ` - ${o.label}` : ""} · SL {o.qty}</p>
                      <p className="text-sm text-slate-500">{d(o.from)} → {d(o.to)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`inline-block text-[11px] font-bold rounded-full px-2 py-0.5 ${DEPOSIT[o.deposit][1]}`}>{DEPOSIT[o.deposit][0]}</span>
                      <p className="text-xs text-slate-400">{STATUS[o.status] ?? o.status} · tạo {d(o.created)}</p>
                    </div>
                  </div>
                  <a href={`tel:${o.phone}`} className="inline-block mt-2 text-sm font-bold text-brand-blue"><i className="fa-solid fa-phone mr-1.5" aria-hidden="true" />{o.phone}</a>
                  <PartnerOrderActions kind={o.kindKey} id={o.id} status={o.status} deposit={o.deposit} arrived={Boolean(o.arrivedAt)} canArrive={canMarkArrived(vnDay(now), vnDay(o.from))} arriveFrom={addDays(vnDay(o.from), -1).split("-").reverse().join("/")} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {requests.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-lg text-slate-800 mb-3">Yêu cầu chỉnh sửa của tôi</h2>
            <ul className="space-y-2">
              {requests.map((r) => (
                <li key={r.id} className="bg-white rounded-2xl shadow-card px-4 py-3 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-slate-700">{r.place.name}</span>
                  <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${REQ_STATUS[r.status][1]}`}>{REQ_STATUS[r.status][0]}</span>
                  <span className="text-xs text-slate-400">{d(r.createdAt)}</span>
                  {r.adminNote && <span className="basis-full text-slate-500">Admin: {r.adminNote}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

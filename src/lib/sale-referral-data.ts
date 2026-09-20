import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-url";
import { ensureReferralCode, getCommissionPercent } from "@/lib/referral";
import { maskName, referralLink } from "@/lib/referral-utils";
import { addDays, vnDay } from "@/lib/booking-report";

// Dữ liệu tab "Giới thiệu & hoa hồng" của Sale (chỉ dữ liệu thuần để truyền xuống component client).
export type SaleReferralData = {
  code: string;
  link: string;
  percent: number;
  referredOrders: number; // số đơn khách đặt qua link của bạn
  paidOrders: number; // số đơn đã nhận cọc (tính hoa hồng)
  visits30: number; // lượt khách bấm link trong 30 ngày qua
  orders30: number; // đơn đã cọc trong 30 ngày qua
  conversionPercent: number | null; // đơn đã cọc / lượt bấm (null khi chưa có lượt bấm)
  pendingAmount: number;
  paidAmount: number;
  items: { id: string; createdAt: string; kind: "stay" | "rental"; placeName: string; customer: string; depositAmount: number; amount: number; status: "PENDING" | "PAID" | "CANCELLED" }[];
  leaderboard: { placeId: string; name: string; orders: number; isMe: boolean }[];
  myRank: number | null;
};

const monthStartVn = () => {
  const vn = new Date(Date.now() + 7 * 3600_000);
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), 1) - 7 * 3600_000);
};

export async function loadSaleReferral(placeId: string): Promise<SaleReferralData> {
  const code = await ensureReferralCode(placeId);
  const monthStart = monthStartVn();
  const from30 = addDays(vnDay(new Date()), -29);
  const since30 = new Date(Date.now() - 30 * 86400000);
  const [percent, stayCount, rentalCount, commissions, sums, board, visitAgg, orders30] = await Promise.all([
    getCommissionPercent(placeId),
    prisma.stayBookingInquiry.count({ where: { referralSalePlaceId: placeId } }),
    prisma.rentalInquiry.count({ where: { referralSalePlaceId: placeId } }),
    prisma.saleCommission.findMany({ where: { salePlaceId: placeId }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.saleCommission.groupBy({ by: ["status"], where: { salePlaceId: placeId }, _sum: { amount: true }, _count: true }),
    prisma.saleCommission.groupBy({ by: ["salePlaceId"], where: { status: { not: "CANCELLED" }, createdAt: { gte: monthStart } }, _count: true, orderBy: { _count: { salePlaceId: "desc" } }, take: 5 }),
    prisma.referralVisit.aggregate({ where: { salePlaceId: placeId, day: { gte: from30 } }, _sum: { visits: true } }),
    prisma.saleCommission.count({ where: { salePlaceId: placeId, status: { not: "CANCELLED" }, createdAt: { gte: since30 } } }),
  ]);
  const visits30 = visitAgg._sum.visits ?? 0;

  const stayIds = commissions.filter((c) => c.kind === "stay").map((c) => c.inquiryId);
  const rentalIds = commissions.filter((c) => c.kind === "rental").map((c) => c.inquiryId);
  const [stays, rentals, names] = await Promise.all([
    prisma.stayBookingInquiry.findMany({ where: { id: { in: stayIds } }, select: { id: true, customerName: true, place: { select: { name: true } } } }),
    prisma.rentalInquiry.findMany({ where: { id: { in: rentalIds } }, select: { id: true, customerName: true, place: { select: { name: true } } } }),
    prisma.place.findMany({ where: { id: { in: board.map((b) => b.salePlaceId) } }, select: { id: true, name: true } }),
  ]);
  const info = new Map<string, { customerName: string; placeName: string }>();
  for (const s of stays) info.set(`stay:${s.id}`, { customerName: s.customerName, placeName: s.place.name });
  for (const r of rentals) info.set(`rental:${r.id}`, { customerName: r.customerName, placeName: r.place.name });

  const sum = (status: string) => sums.find((s) => s.status === status)?._sum.amount ?? 0;
  const paidOrders = sums.filter((s) => s.status !== "CANCELLED").reduce((n, s) => n + s._count, 0);
  const nameOf = new Map(names.map((n) => [n.id, n.name]));
  const leaderboard = board.map((b) => ({ placeId: b.salePlaceId, name: nameOf.get(b.salePlaceId) ?? "Sale", orders: b._count, isMe: b.salePlaceId === placeId }));
  const myIdx = leaderboard.findIndex((l) => l.isMe);

  return {
    code,
    link: referralLink(SITE_URL, code),
    percent,
    referredOrders: stayCount + rentalCount,
    paidOrders,
    visits30,
    orders30,
    conversionPercent: visits30 > 0 ? Math.min(100, Math.round((orders30 / visits30) * 100)) : null,
    pendingAmount: sum("PENDING"),
    paidAmount: sum("PAID"),
    items: commissions.map((c) => {
      const i = info.get(`${c.kind}:${c.inquiryId}`);
      return {
        id: c.id,
        createdAt: c.createdAt.toISOString(),
        kind: c.kind === "rental" ? "rental" : "stay",
        placeName: i?.placeName ?? "—",
        customer: maskName(i?.customerName ?? ""),
        depositAmount: c.depositAmount,
        amount: c.amount,
        status: c.status,
      };
    }),
    leaderboard,
    myRank: myIdx >= 0 ? myIdx + 1 : null,
  };
}

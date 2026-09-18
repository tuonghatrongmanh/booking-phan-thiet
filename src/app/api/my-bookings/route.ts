import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { getPaymentSettings } from "@/lib/payment-settings";
import { serializeBooking } from "@/lib/booking-serialize";

// GET /api/my-bookings - các đơn đặt phòng/thuê xe của thành viên đang đăng nhập (đơn được
// gắn với tài khoản lúc đặt nếu khách đã đăng nhập). Khách chưa đăng nhập dùng mã đơn + SĐT.
export async function GET() {
  const actor = await getActor();
  if (!actor || actor.type !== "user") return NextResponse.json({ items: [] });

  const [rentals, stays, settings] = await Promise.all([
    prisma.rentalInquiry.findMany({
      where: { userId: actor.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { place: { select: { name: true } } },
    }),
    prisma.stayBookingInquiry.findMany({
      where: { userId: actor.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { place: { select: { name: true } } },
    }),
    getPaymentSettings(),
  ]);

  const items = [
    ...rentals.map((r) => serializeBooking({ kind: "rental", record: r }, settings)),
    ...stays.map((s) => serializeBooking({ kind: "stay", record: s }, settings)),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  return NextResponse.json({ items });
}

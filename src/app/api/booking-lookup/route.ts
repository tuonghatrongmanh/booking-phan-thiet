import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-log";
import { findBookingByRef } from "@/lib/booking-lookup";
import { getPaymentSettings } from "@/lib/payment-settings";
import { canTakeDeposit, buildDepositInfo } from "@/lib/booking-deposit";
import { formatBookingDate } from "@/lib/booking-notify";
import { z } from "zod";

const schema = z.object({ ref: z.string().min(1).max(30), phone: z.string().min(1).max(20) });

// POST /api/booking-lookup - khách tra cứu trạng thái đơn bằng mã đơn + số điện thoại.
// Nếu đơn còn "chờ cọc" thì trả lại luôn thông tin QR để khách chuyển tiếp (phòng khi
// khách lỡ đóng cửa sổ QR).
export async function POST(req: NextRequest) {
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  if (!rateLimit(`booking-lookup:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Bạn tra cứu quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vui lòng nhập mã đơn và số điện thoại" }, { status: 400 });

  const found = await findBookingByRef(parsed.data.ref, parsed.data.phone);
  if (!found) {
    return NextResponse.json({ error: "Không tìm thấy đơn với mã và số điện thoại này" }, { status: 404 });
  }

  const r = found.record;
  const isRental = found.kind === "rental";
  const settings = await getPaymentSettings();
  const pending = r.depositStatus === "PENDING" && r.status !== "CANCELLED" && r.depositRef && r.depositAmount;

  return NextResponse.json({
    kind: found.kind,
    placeName: r.place.name,
    dateText: isRental
      ? `${formatBookingDate(found.record.pickupDate)} → ${formatBookingDate(found.record.returnDate)}`
      : `${formatBookingDate(found.record.checkinDate)} → ${formatBookingDate(found.record.checkoutDate)}`,
    detailText: isRental
      ? `${found.record.quantity} xe`
      : found.record.optionLabel
        ? found.record.optionWhole
          ? found.record.optionLabel
          : `${found.record.optionLabel} x ${found.record.quantity}`
        : null,
    customerName: r.customerName,
    status: r.status,
    depositStatus: r.depositStatus,
    depositAmount: r.depositAmount,
    depositRef: r.depositRef,
    depositPaidAt: r.depositPaidAt,
    reportedPaid: Boolean(r.customerReportedPaidAt),
    createdAt: r.createdAt,
    deposit:
      pending && canTakeDeposit(settings) ? buildDepositInfo(settings, r.depositRef!, r.depositAmount!) : null,
  });
}

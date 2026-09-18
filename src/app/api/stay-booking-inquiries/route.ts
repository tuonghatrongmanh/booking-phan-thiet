import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-log";
import { getActor } from "@/lib/auth-actor";
import { hasStayDateConflict } from "@/lib/booking-availability";
import { getPaymentSettings } from "@/lib/payment-settings";
import { buildVietQrImageUrl, generateDepositRef } from "@/lib/vietqr";
import { z } from "zod";

const schema = z.object({
  placeId: z.string().min(1),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
  checkinDate: z.string().min(1),
  checkoutDate: z.string().min(1),
  guestCount: z.number().int().positive().max(50).optional(),
  note: z.string().trim().max(500).optional(),
});

// POST /api/stay-booking-inquiries - khách đặt phòng homestay gửi yêu cầu (lead),
// tương tự /api/rental-inquiries (xem comment ở đó để biết lý do không hard-block
// theo đơn chưa cọc). Trước đây homestay chỉ có liên hệ qua điện thoại/Zalo, chưa
// có form đặt chỗ có ngày.
export async function POST(req: NextRequest) {
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  if (!rateLimit(`stay-booking-inquiry:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Bạn gửi yêu cầu quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { placeId, customerName, customerPhone, checkinDate, checkoutDate, guestCount, note } = parsed.data;

  const checkin = new Date(checkinDate);
  const checkout = new Date(checkoutDate);
  if (Number.isNaN(checkin.getTime()) || Number.isNaN(checkout.getTime()) || checkout <= checkin) {
    return NextResponse.json({ error: "Ngày nhận/trả phòng không hợp lệ" }, { status: 400 });
  }
  // Chừa 1 ngày đệm cho lệch múi giờ giữa trình duyệt khách và server
  if (checkin.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "Ngày nhận phòng không được ở quá khứ" }, { status: 400 });
  }

  const place = await prisma.place.findUnique({ where: { id: placeId }, select: { id: true, category: true } });
  if (!place || place.category !== "HOMESTAY") {
    return NextResponse.json({ error: "Không tìm thấy chỗ ở" }, { status: 404 });
  }

  const conflict = await hasStayDateConflict(placeId, checkin, checkout);
  if (conflict) {
    return NextResponse.json(
      { error: "Chỗ ở đã có khách đặt cọc giữ chỗ trong khoảng ngày này, vui lòng chọn ngày khác" },
      { status: 409 }
    );
  }

  const actor = await getActor();
  const userId = actor?.type === "user" ? actor.id : undefined;

  const paymentSettings = await getPaymentSettings();
  const canDeposit = Boolean(paymentSettings.bankBin && paymentSettings.bankAccountNumber);
  const depositRef = canDeposit ? generateDepositRef() : undefined;

  const inquiry = await prisma.stayBookingInquiry.create({
    data: {
      placeId,
      userId,
      customerName,
      customerPhone,
      checkinDate: checkin,
      checkoutDate: checkout,
      guestCount,
      note,
      depositAmount: canDeposit ? paymentSettings.depositAmountVnd : undefined,
      depositStatus: canDeposit ? "PENDING" : "NONE",
      depositRef,
    },
  });

  const deposit =
    canDeposit && depositRef
      ? {
          amount: paymentSettings.depositAmountVnd,
          ref: depositRef,
          qrImageUrl: buildVietQrImageUrl({
            bankBin: paymentSettings.bankBin!,
            accountNumber: paymentSettings.bankAccountNumber!,
            accountName: paymentSettings.bankAccountName ?? "",
            amount: paymentSettings.depositAmountVnd,
            message: depositRef,
          }),
          bankLabel: paymentSettings.bankLabel,
          bankAccountNumber: paymentSettings.bankAccountNumber,
          bankAccountName: paymentSettings.bankAccountName,
        }
      : null;

  return NextResponse.json({ item: inquiry, deposit }, { status: 201 });
}

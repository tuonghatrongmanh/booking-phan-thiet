import { NextRequest, NextResponse } from "next/server";
import { resolveReferral } from "@/lib/referral";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-log";
import { getActor } from "@/lib/auth-actor";
import { checkCarRentalAvailability } from "@/lib/booking-availability";
import { getPaymentSettings } from "@/lib/payment-settings";
import { computeCarDeposit, canTakeDeposit, buildDepositInfo } from "@/lib/booking-deposit";
import { generateDepositRef } from "@/lib/vietqr";
import {
  notifyAdminNewBooking,
  emailBookingReceived,
  formatBookingDate,
  type BookingSummary,
} from "@/lib/booking-notify";
import { z } from "zod";

const schema = z.object({
  placeId: z.string().min(1),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
  customerEmail: z
    .string()
    .trim()
    .max(120)
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  quantity: z.number().int().min(1, "Số xe tối thiểu là 1").max(20).optional().default(1),
  pickupDate: z.string().min(1),
  returnDate: z.string().min(1),
  pickupLocation: z.string().trim().min(1).max(200).optional(),
  note: z.string().trim().max(500).optional(),
});

// POST /api/rental-inquiries - khách đặt thuê xe gửi yêu cầu (lead). Nếu đã cấu
// hình PaymentSettings (Cài đặt > Thanh toán), tạo thêm 1 QR VietQR để khách đặt
// cọc giữ chỗ - tiền cọc = cọc mỗi xe x số xe (tính ở server). CHỈ đơn đã nhận cọc
// thực sự (depositStatus=PAID, admin xác nhận tay) mới được tính là "chiếm" xe khi
// kiểm tra còn xe cho đơn khác. Nếu chưa cấu hình thanh toán, vẫn tạo đơn như bình
// thường (không có cọc), nhân viên liên hệ qua số điện thoại như trước.
export async function POST(req: NextRequest) {
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  if (!rateLimit(`rental-inquiry:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Bạn gửi yêu cầu quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { placeId, customerName, customerPhone, customerEmail, quantity, pickupDate, returnDate, pickupLocation, note } =
    parsed.data;

  const pickup = new Date(pickupDate);
  const ret = new Date(returnDate);
  if (Number.isNaN(pickup.getTime()) || Number.isNaN(ret.getTime()) || ret < pickup) {
    return NextResponse.json({ error: "Ngày nhận/trả xe không hợp lệ" }, { status: 400 });
  }
  // Chừa 1 ngày đệm cho lệch múi giờ giữa trình duyệt khách và server
  if (pickup.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "Ngày nhận xe không được ở quá khứ" }, { status: 400 });
  }

  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: { id: true, name: true, category: true, totalRooms: true, depositVnd: true },
  });
  if (!place || place.category !== "CAR_RENTAL") {
    return NextResponse.json({ error: "Không tìm thấy xe" }, { status: 404 });
  }

  const stock = Math.max(1, place.totalRooms ?? 1);
  if (quantity > stock) {
    return NextResponse.json({ error: `Loại xe này hiện có tối đa ${stock} xe, vui lòng giảm số lượng` }, { status: 400 });
  }
  const availability = await checkCarRentalAvailability({ placeId, stock, quantity, pickupDate: pickup, returnDate: ret });
  if (!availability.ok) {
    return NextResponse.json({ error: availability.message }, { status: 409 });
  }

  const actor = await getActor();
  const userId = actor?.type === "user" ? actor.id : undefined;

  const paymentSettings = await getPaymentSettings();
  const canDeposit = canTakeDeposit(paymentSettings);
  const depositRef = canDeposit ? generateDepositRef() : undefined;
  const depositAmount = canDeposit
    ? computeCarDeposit({ placeDepositVnd: place.depositVnd, defaultDepositVnd: paymentSettings.depositAmountVnd, quantity })
    : undefined;

  const inquiry = await prisma.rentalInquiry.create({
    data: {
      placeId,
      userId,
      referralSalePlaceId: await resolveReferral(userId),
      customerName,
      customerPhone,
      customerEmail,
      quantity,
      pickupDate: pickup,
      returnDate: ret,
      pickupLocation,
      note,
      depositAmount,
      depositStatus: canDeposit ? "PENDING" : "NONE",
      depositRef,
    },
  });

  const deposit = canDeposit && depositRef && depositAmount ? buildDepositInfo(paymentSettings, depositRef, depositAmount) : null;

  const summary: BookingSummary = {
    id: inquiry.id,
    kind: "rental",
    placeName: place.name,
    customerName,
    customerPhone,
    customerEmail,
    dateText: `${formatBookingDate(pickup)} → ${formatBookingDate(ret)}`,
    detailText: `${quantity} xe`,
    depositAmount: depositAmount ?? null,
    depositRef: depositRef ?? null,
  };
  notifyAdminNewBooking(summary);
  void emailBookingReceived(summary);

  return NextResponse.json({ item: inquiry, deposit }, { status: 201 });
}

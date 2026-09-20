import { NextRequest, NextResponse } from "next/server";
import { resolveReferral } from "@/lib/referral";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-log";
import { getActor } from "@/lib/auth-actor";
import { checkStayAvailability } from "@/lib/booking-availability";
import { getPaymentSettings } from "@/lib/payment-settings";
import { computeStayDeposit, canTakeDeposit, buildDepositInfo } from "@/lib/booking-deposit";
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
  optionId: z.string().min(1).optional(),
  quantity: z.number().int().min(1, "Số phòng tối thiểu là 1").max(20).optional().default(1),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
  customerEmail: z
    .string()
    .trim()
    .max(120)
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  checkinDate: z.string().min(1),
  checkoutDate: z.string().min(1),
  guestCount: z.number().int().positive().max(50).optional(),
  note: z.string().trim().max(500).optional(),
});

// POST /api/stay-booking-inquiries - khách đặt phòng homestay gửi yêu cầu (lead),
// tương tự /api/rental-inquiries (xem comment ở đó để biết lý do không hard-block
// theo đơn chưa cọc). Nếu chỗ ở có "gói phòng" (PlaceBookingOption: phòng đơn, phòng
// đôi, nguyên căn...) thì khách phải chọn 1 gói và tiền cọc = cọc của gói x số phòng.
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

  const { placeId, optionId, customerName, customerPhone, customerEmail, checkinDate, checkoutDate, guestCount, note } =
    parsed.data;

  const checkin = new Date(checkinDate);
  const checkout = new Date(checkoutDate);
  if (Number.isNaN(checkin.getTime()) || Number.isNaN(checkout.getTime()) || checkout <= checkin) {
    return NextResponse.json({ error: "Ngày nhận/trả phòng không hợp lệ" }, { status: 400 });
  }
  // Chừa 1 ngày đệm cho lệch múi giờ giữa trình duyệt khách và server
  if (checkin.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "Ngày nhận phòng không được ở quá khứ" }, { status: 400 });
  }

  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: {
      id: true,
      name: true,
      category: true,
      depositVnd: true,
      bookingOptions: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!place || place.category !== "HOMESTAY") {
    return NextResponse.json({ error: "Không tìm thấy chỗ ở" }, { status: 404 });
  }

  const option = place.bookingOptions.find((o) => o.id === optionId) ?? null;
  if (place.bookingOptions.length > 0 && !option) {
    return NextResponse.json({ error: "Vui lòng chọn loại phòng" }, { status: 400 });
  }
  // Chỗ ở chưa có gói nào (dữ liệu cũ): đặt cả chỗ ở, 1 đơn vị.
  const quantity = option && !option.wholeProperty ? parsed.data.quantity : 1;
  if (option && quantity > option.maxUnits) {
    return NextResponse.json({ error: `Loại phòng này chỉ có tối đa ${option.maxUnits} phòng` }, { status: 400 });
  }

  const availability = await checkStayAvailability({
    placeId,
    option: option ? { id: option.id, maxUnits: option.maxUnits, wholeProperty: option.wholeProperty } : null,
    quantity,
    checkinDate: checkin,
    checkoutDate: checkout,
  });
  if (!availability.ok) {
    return NextResponse.json({ error: availability.message }, { status: 409 });
  }

  const actor = await getActor();
  const userId = actor?.type === "user" ? actor.id : undefined;

  const paymentSettings = await getPaymentSettings();
  const canDeposit = canTakeDeposit(paymentSettings);
  const depositRef = canDeposit ? generateDepositRef() : undefined;
  const depositAmount = canDeposit
    ? computeStayDeposit({
        optionDepositVnd: option?.depositVnd ?? null,
        placeDepositVnd: place.depositVnd,
        defaultDepositVnd: paymentSettings.depositAmountVnd,
        quantity,
      })
    : undefined;

  const inquiry = await prisma.stayBookingInquiry.create({
    data: {
      placeId,
      userId,
      referralSalePlaceId: await resolveReferral(userId),
      optionId: option?.id,
      optionLabel: option?.label,
      optionWhole: option?.wholeProperty ?? false,
      quantity,
      customerName,
      customerPhone,
      customerEmail,
      checkinDate: checkin,
      checkoutDate: checkout,
      guestCount,
      note,
      depositAmount,
      depositStatus: canDeposit ? "PENDING" : "NONE",
      depositRef,
    },
  });

  const deposit = canDeposit && depositRef && depositAmount ? buildDepositInfo(paymentSettings, depositRef, depositAmount) : null;

  const summary: BookingSummary = {
    id: inquiry.id,
    kind: "stay",
    placeName: place.name,
    customerName,
    customerPhone,
    customerEmail,
    dateText: `${formatBookingDate(checkin)} → ${formatBookingDate(checkout)}`,
    detailText: option ? (option.wholeProperty ? option.label : `${option.label} x ${quantity}`) : null,
    depositAmount: depositAmount ?? null,
    depositRef: depositRef ?? null,
  };
  notifyAdminNewBooking(summary);
  void emailBookingReceived(summary);

  return NextResponse.json({ item: inquiry, deposit }, { status: 201 });
}

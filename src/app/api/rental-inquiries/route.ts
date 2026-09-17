import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-log";
import { z } from "zod";

const schema = z.object({
  placeId: z.string().min(1),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
  pickupDate: z.string().min(1),
  returnDate: z.string().min(1),
  pickupLocation: z.string().trim().min(1).max(200).optional(),
  note: z.string().trim().max(500).optional(),
});

// POST /api/rental-inquiries - khách đặt thuê xe gửi yêu cầu (lead), KHÔNG phải
// đặt chỗ tự động theo từng ngày (không có hệ thống lịch/kho theo ngày) - nhân viên
// sẽ liên hệ lại qua số điện thoại, tương tự Redemption (xử lý thủ công).
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

  const { placeId, customerName, customerPhone, pickupDate, returnDate, pickupLocation, note } = parsed.data;

  const pickup = new Date(pickupDate);
  const ret = new Date(returnDate);
  if (Number.isNaN(pickup.getTime()) || Number.isNaN(ret.getTime()) || ret < pickup) {
    return NextResponse.json({ error: "Ngày nhận/trả xe không hợp lệ" }, { status: 400 });
  }

  const place = await prisma.place.findUnique({ where: { id: placeId }, select: { id: true, category: true } });
  if (!place || place.category !== "CAR_RENTAL") {
    return NextResponse.json({ error: "Không tìm thấy xe" }, { status: 404 });
  }

  const inquiry = await prisma.rentalInquiry.create({
    data: {
      placeId,
      customerName,
      customerPhone,
      pickupDate: pickup,
      returnDate: ret,
      pickupLocation,
      note,
    },
  });

  return NextResponse.json({ item: inquiry }, { status: 201 });
}

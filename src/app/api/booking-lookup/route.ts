import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-log";
import { findBookingByRef } from "@/lib/booking-lookup";
import { getPaymentSettings } from "@/lib/payment-settings";
import { serializeBooking } from "@/lib/booking-serialize";
import { z } from "zod";

const schema = z.object({ ref: z.string().min(1).max(30), phone: z.string().min(1).max(20) });

// POST /api/booking-lookup - khách tra cứu trạng thái đơn bằng mã đơn + số điện thoại.
// Nếu đơn còn "chờ cọc" thì trả lại luôn thông tin QR để khách chuyển tiếp (phòng khi
// khách lỡ đóng cửa sổ QR).
export async function POST(req: NextRequest) {
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  // Trang tra cứu tự tải tối đa 10 đơn đã nhớ trên thiết bị nên ngưỡng để rộng hơn 1 chút
  if (!rateLimit(`booking-lookup:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Bạn tra cứu quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vui lòng nhập mã đơn và số điện thoại" }, { status: 400 });

  const found = await findBookingByRef(parsed.data.ref, parsed.data.phone);
  if (!found) {
    return NextResponse.json({ error: "Không tìm thấy đơn với mã và số điện thoại này" }, { status: 404 });
  }

  return NextResponse.json(serializeBooking(found, await getPaymentSettings()));
}

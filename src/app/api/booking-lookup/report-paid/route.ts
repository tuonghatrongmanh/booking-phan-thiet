import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-log";
import { findBookingByRef } from "@/lib/booking-lookup";
import { checkCanReportPaid } from "@/lib/booking-status";
import { notifyAdminReportedPaid } from "@/lib/booking-notify";
import { summaryFromRental, summaryFromStay } from "@/lib/booking-summary";
import { z } from "zod";

const schema = z.object({
  ref: z.string().min(1).max(30),
  phone: z.string().min(1).max(20),
  note: z.string().trim().max(120).optional(),
});

// POST /api/booking-lookup/report-paid - khách bấm "Tôi đã chuyển khoản". CHỈ để NHẮC
// admin kiểm tra ngân hàng (đánh dấu đơn + báo Telegram/chuông) - KHÔNG đổi depositStatus
// sang PAID. Xác nhận đã nhận tiền vẫn là việc của admin, nên khách bấm bừa cũng không
// thể giữ chỗ hay chiếm ngày của ai. Có giới hạn số lần và thời gian chờ (booking-status.ts).
export async function POST(req: NextRequest) {
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  if (!rateLimit(`booking-report-paid:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Bạn thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const found = await findBookingByRef(parsed.data.ref, parsed.data.phone);
  if (!found) return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });

  const record = found.record;
  if (record.depositStatus !== "PENDING" || record.status === "CANCELLED") {
    return NextResponse.json({ error: "Đơn này không còn ở trạng thái chờ cọc" }, { status: 400 });
  }
  const check = checkCanReportPaid(record);
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 });

  const data = {
    customerReportedPaidAt: new Date(),
    paymentClaimCount: { increment: 1 },
    paymentClaimNote: parsed.data.note || null,
  };
  if (found.kind === "rental") {
    const updated = await prisma.rentalInquiry.update({ where: { id: record.id }, data, include: { place: { select: { name: true } } } });
    notifyAdminReportedPaid(summaryFromRental(updated), parsed.data.note);
  } else {
    const updated = await prisma.stayBookingInquiry.update({ where: { id: record.id }, data, include: { place: { select: { name: true } } } });
    notifyAdminReportedPaid(summaryFromStay(updated), parsed.data.note);
  }

  return NextResponse.json({ ok: true });
}

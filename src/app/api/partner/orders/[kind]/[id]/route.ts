import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { rateLimit } from "@/lib/rate-limit";
import { canMarkArrived, vnDay } from "@/lib/booking-report";

const schema = z.object({ action: z.enum(["contacted", "arrived", "undo-arrived", "done"]) });
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

// PATCH /api/partner/orders/:kind/:id { action } - chủ homestay/xe cập nhật tiến độ đơn CỦA CHỖ MÌNH:
//   contacted    : đã liên hệ khách (Mới -> Đã liên hệ)
//   arrived      : khách đã đến (chỉ đơn ĐÃ NHẬN CỌC, từ 1 ngày trước ngày nhận)
//   undo-arrived : bấm nhầm, hoàn tác (chưa hoàn tất)
//   done         : hoàn tất (phải đã đánh dấu khách đến)
// Chủ nhà KHÔNG hủy được đơn và không đụng tới tiền cọc: hủy/hoàn cọc/hoa hồng do admin xử lý.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") return fail("Vui lòng đăng nhập", 401);
  if (!rateLimit(`partner-order:${actor.id}`, 60, 60 * 60_000)) return fail("Bạn thao tác quá nhanh, vui lòng thử lại sau", 429);

  const { kind, id } = await params;
  if (kind !== "stay" && kind !== "rental") return fail("Không tìm thấy", 404);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Dữ liệu không hợp lệ");

  const inq =
    kind === "stay"
      ? await prisma.stayBookingInquiry.findUnique({ where: { id }, select: { status: true, depositStatus: true, arrivedAt: true, checkinDate: true, place: { select: { partnerUserId: true } } } })
      : await prisma.rentalInquiry.findUnique({ where: { id }, select: { status: true, depositStatus: true, arrivedAt: true, pickupDate: true, place: { select: { partnerUserId: true } } } });
  // Không phải chủ của chỗ này: coi như không tồn tại
  if (!inq || inq.place.partnerUserId !== actor.id) return fail("Không tìm thấy đơn", 404);
  if (inq.status === "CANCELLED") return fail("Đơn này đã bị hủy");

  const start = "checkinDate" in inq ? inq.checkinDate : inq.pickupDate;
  const data: { status?: "CONTACTED" | "DONE"; arrivedAt?: Date | null } = {};
  switch (parsed.data.action) {
    case "contacted":
      if (inq.status !== "PENDING") return fail("Đơn này đã được liên hệ rồi");
      data.status = "CONTACTED";
      break;
    case "arrived":
      if (inq.depositStatus !== "PAID") return fail("Chỉ đánh dấu được khi đơn đã nhận cọc");
      if (inq.arrivedAt) return fail("Đơn này đã được đánh dấu khách đến");
      if (!canMarkArrived(vnDay(new Date()), vnDay(start))) return fail("Chưa đến ngày nhận - chỉ đánh dấu được từ 1 ngày trước ngày nhận");
      data.arrivedAt = new Date();
      break;
    case "undo-arrived":
      if (!inq.arrivedAt) return fail("Đơn này chưa đánh dấu khách đến");
      if (inq.status === "DONE") return fail("Đơn đã hoàn tất, không hoàn tác được");
      data.arrivedAt = null;
      break;
    case "done":
      if (!inq.arrivedAt) return fail("Hãy đánh dấu khách đã đến trước khi hoàn tất");
      if (inq.status === "DONE") return fail("Đơn này đã hoàn tất rồi");
      data.status = "DONE";
      break;
  }

  const updated =
    kind === "stay"
      ? await prisma.stayBookingInquiry.update({ where: { id }, data, select: { status: true, arrivedAt: true } })
      : await prisma.rentalInquiry.update({ where: { id }, data, select: { status: true, arrivedAt: true } });
  return NextResponse.json({ ok: true, status: updated.status, arrivedAt: updated.arrivedAt });
}

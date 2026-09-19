import type { Admin } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit-log";
import { checkCarRentalAvailability, checkStayAvailability } from "@/lib/booking-availability";
import { emailDepositConfirmed, emailDepositNotFound } from "@/lib/booking-notify";
import { summaryFromRental, summaryFromStay } from "@/lib/booking-summary";

// Logic "xác nhận đã nhận cọc" / "chưa nhận được tiền" dùng CHUNG cho trang admin và nút bấm
// trong Telegram - một nơi duy nhất nên hai đường không thể lệch nhau (kiểm tra còn phòng/xe,
// email khách, nhật ký hành động).
export type BookingKindKey = "stay" | "rental";

// Người thực hiện: admin đăng nhập, hoặc chủ web bấm nút trong Telegram (không có tài khoản admin)
export type Actor = { admin: Admin } | { telegram: { userId: string } };

export type ActionResult = { ok: true; item: unknown; label: string } | { ok: false; status: number; error: string };

const fail = (status: number, error: string): ActionResult => ({ ok: false, status, error });

async function audit(actor: Actor, action: string, targetType: string, targetId: string, detail: string) {
  if ("admin" in actor) {
    await logAdminAction(actor.admin, action, targetType, targetId, detail);
    return;
  }
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: null,
        adminName: "Telegram",
        adminEmail: `telegram:${actor.telegram.userId}`,
        action,
        targetType,
        targetId,
        detail: `${detail} (bấm nút trong Telegram)`,
      },
    });
  } catch (err) {
    console.error("[booking-actions] ghi nhật ký thất bại:", err);
  }
}

export async function confirmDeposit(kind: BookingKindKey, id: string, actor: Actor): Promise<ActionResult> {
  if (kind === "rental") {
    const inquiry = await prisma.rentalInquiry.findUnique({ where: { id }, include: { place: { select: { name: true, totalRooms: true } } } });
    if (!inquiry) return fail(404, "Không tìm thấy đơn");
    if (inquiry.depositStatus === "PAID") return fail(400, "Đơn này đã được xác nhận cọc rồi");
    if (inquiry.status === "CANCELLED") return fail(400, "Đơn này đã bị huỷ, không thể xác nhận cọc");

    // Nhiều khách cùng chuyển cọc cho cùng ngày: đơn chốt trước giữ xe, đơn sau bị chặn nếu hết xe
    const availability = await checkCarRentalAvailability({
      placeId: inquiry.placeId,
      stock: inquiry.place.totalRooms,
      quantity: inquiry.quantity,
      pickupDate: inquiry.pickupDate,
      returnDate: inquiry.returnDate,
      excludeId: id,
    });
    if (!availability.ok) return fail(409, `${availability.message}. Hãy liên hệ khách để đổi ngày hoặc hoàn tiền cọc.`);

    const updated = await prisma.rentalInquiry.update({ where: { id }, data: { depositStatus: "PAID", depositPaidAt: new Date() } });
    void audit(actor, "confirm-deposit", "RentalInquiry", id, `${inquiry.customerName} - ${inquiry.depositAmount ?? 0}đ`);
    void emailDepositConfirmed(summaryFromRental(inquiry));
    return { ok: true, item: updated, label: `${inquiry.customerName} - ${inquiry.place.name}` };
  }

  const inquiry = await prisma.stayBookingInquiry.findUnique({ where: { id }, include: { place: { select: { name: true } } } });
  if (!inquiry) return fail(404, "Không tìm thấy đơn");
  if (inquiry.depositStatus === "PAID") return fail(400, "Đơn này đã được xác nhận cọc rồi");
  if (inquiry.status === "CANCELLED") return fail(400, "Đơn này đã bị huỷ, không thể xác nhận cọc");

  const option = inquiry.optionId ? await prisma.placeBookingOption.findUnique({ where: { id: inquiry.optionId } }) : null;
  const availability = await checkStayAvailability({
    placeId: inquiry.placeId,
    // Gói đã bị xóa sau khi khách đặt: dùng ảnh chụp trên đơn (chỉ tính 1 lần đặt này)
    option: inquiry.optionLabel
      ? { id: inquiry.optionId ?? `deleted:${id}`, maxUnits: option?.maxUnits ?? inquiry.quantity, wholeProperty: option?.wholeProperty ?? inquiry.optionWhole }
      : null,
    quantity: inquiry.quantity,
    checkinDate: inquiry.checkinDate,
    checkoutDate: inquiry.checkoutDate,
    excludeId: id,
  });
  if (!availability.ok) return fail(409, `${availability.message}. Hãy liên hệ khách để đổi ngày hoặc hoàn tiền cọc.`);

  const updated = await prisma.stayBookingInquiry.update({ where: { id }, data: { depositStatus: "PAID", depositPaidAt: new Date() } });
  void audit(actor, "confirm-deposit", "StayBookingInquiry", id, `${inquiry.customerName} - ${inquiry.depositAmount ?? 0}đ`);
  void emailDepositConfirmed(summaryFromStay(inquiry));
  return { ok: true, item: updated, label: `${inquiry.customerName} - ${inquiry.place.name}` };
}

export async function rejectClaim(kind: BookingKindKey, id: string, actor: Actor): Promise<ActionResult> {
  if (kind === "rental") {
    const inquiry = await prisma.rentalInquiry.findUnique({ where: { id }, include: { place: { select: { name: true } } } });
    if (!inquiry) return fail(404, "Không tìm thấy đơn");
    if (inquiry.depositStatus !== "PENDING") return fail(400, "Đơn này không ở trạng thái chờ cọc");
    if (!inquiry.customerReportedPaidAt) return fail(400, "Khách chưa bấm báo đã chuyển khoản");
    const updated = await prisma.rentalInquiry.update({ where: { id }, data: { customerReportedPaidAt: null, paymentClaimRejectedAt: new Date() } });
    void audit(actor, "reject-deposit-claim", "RentalInquiry", id, `${inquiry.customerName} - chưa nhận được tiền`);
    void emailDepositNotFound(summaryFromRental(inquiry));
    return { ok: true, item: updated, label: `${inquiry.customerName} - ${inquiry.place.name}` };
  }

  const inquiry = await prisma.stayBookingInquiry.findUnique({ where: { id }, include: { place: { select: { name: true } } } });
  if (!inquiry) return fail(404, "Không tìm thấy đơn");
  if (inquiry.depositStatus !== "PENDING") return fail(400, "Đơn này không ở trạng thái chờ cọc");
  if (!inquiry.customerReportedPaidAt) return fail(400, "Khách chưa bấm báo đã chuyển khoản");
  const updated = await prisma.stayBookingInquiry.update({ where: { id }, data: { customerReportedPaidAt: null, paymentClaimRejectedAt: new Date() } });
  void audit(actor, "reject-deposit-claim", "StayBookingInquiry", id, `${inquiry.customerName} - chưa nhận được tiền`);
  void emailDepositNotFound(summaryFromStay(inquiry));
  return { ok: true, item: updated, label: `${inquiry.customerName} - ${inquiry.place.name}` };
}

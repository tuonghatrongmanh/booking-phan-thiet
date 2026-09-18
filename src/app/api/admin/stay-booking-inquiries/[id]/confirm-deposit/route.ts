import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { checkStayAvailability } from "@/lib/booking-availability";
import { emailDepositConfirmed } from "@/lib/booking-notify";
import { summaryFromStay } from "@/lib/booking-summary";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { admin, error } = await requireSectionAccess("homestay");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "homestay", "edit");
  if (permError) return permError;

  const { id } = await params;
  const inquiry = await prisma.stayBookingInquiry.findUnique({
    where: { id },
    include: { place: { select: { name: true } } },
  });
  if (!inquiry) return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });
  if (inquiry.depositStatus === "PAID") {
    return NextResponse.json({ error: "Đơn này đã được xác nhận cọc rồi" }, { status: 400 });
  }
  if (inquiry.status === "CANCELLED") {
    return NextResponse.json({ error: "Đơn này đã bị huỷ, không thể xác nhận cọc" }, { status: 400 });
  }

  // Hai khách cùng chuyển cọc cho cùng chỗ/ngày trước khi đơn nào được chốt: đơn chốt trước
  // giữ phòng, đơn sau bị chặn nếu không còn đủ phòng - admin phải đổi ngày/hoàn tiền.
  const option = inquiry.optionId ? await prisma.placeBookingOption.findUnique({ where: { id: inquiry.optionId } }) : null;
  const availability = await checkStayAvailability({
    placeId: inquiry.placeId,
    // Gói đã bị xóa sau khi khách đặt: dùng ảnh chụp trên đơn (chỉ tính 1 lần đặt này)
    option: inquiry.optionLabel
      ? {
          id: inquiry.optionId ?? `deleted:${id}`,
          maxUnits: option?.maxUnits ?? inquiry.quantity,
          wholeProperty: option?.wholeProperty ?? inquiry.optionWhole,
        }
      : null,
    quantity: inquiry.quantity,
    checkinDate: inquiry.checkinDate,
    checkoutDate: inquiry.checkoutDate,
    excludeId: id,
  });
  if (!availability.ok) {
    return NextResponse.json(
      { error: `${availability.message}. Hãy liên hệ khách để đổi ngày hoặc hoàn tiền cọc.` },
      { status: 409 }
    );
  }

  const updated = await prisma.stayBookingInquiry.update({
    where: { id },
    data: { depositStatus: "PAID", depositPaidAt: new Date() },
  });

  void logAdminAction(admin, "confirm-deposit", "StayBookingInquiry", id, `${inquiry.customerName} - ${inquiry.depositAmount ?? 0}đ`);
  void emailDepositConfirmed(summaryFromStay(inquiry));

  return NextResponse.json({ item: updated });
}

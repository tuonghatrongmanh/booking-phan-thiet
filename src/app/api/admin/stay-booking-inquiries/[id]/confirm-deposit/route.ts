import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { hasStayDateConflict } from "@/lib/booking-availability";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { admin, error } = await requireSectionAccess("homestay");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "homestay", "edit");
  if (permError) return permError;

  const { id } = await params;
  const inquiry = await prisma.stayBookingInquiry.findUnique({ where: { id } });
  if (!inquiry) return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });
  if (inquiry.depositStatus === "PAID") {
    return NextResponse.json({ error: "Đơn này đã được xác nhận cọc rồi" }, { status: 400 });
  }

  // Hai khach cung chuyen coc cho cung ngay truoc khi don nao duoc chot: don dau chot thanh cong,
  // don sau phai bi chan de admin doi ngay/hoan tien, khong duoc de trung lich.
  const conflict = await hasStayDateConflict(inquiry.placeId, inquiry.checkinDate, inquiry.checkoutDate, id);
  if (conflict) {
    return NextResponse.json(
      { error: "Đã có đơn khác được xác nhận cọc trùng ngày này. Hãy liên hệ khách để đổi ngày hoặc hoàn tiền cọc." },
      { status: 409 }
    );
  }

  const updated = await prisma.stayBookingInquiry.update({
    where: { id },
    data: { depositStatus: "PAID", depositPaidAt: new Date() },
  });

  void logAdminAction(admin, "confirm-deposit", "StayBookingInquiry", id, `${inquiry.customerName} - ${inquiry.depositAmount ?? 0}đ`);

  return NextResponse.json({ item: updated });
}

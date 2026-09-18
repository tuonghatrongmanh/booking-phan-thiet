import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { hasCarRentalDateConflict } from "@/lib/booking-availability";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/rental-inquiries/:id/confirm-deposit - admin kiểm tra tay trong
// app ngân hàng của họ thấy tiền vào đúng mã tham chiếu, rồi bấm nút này để chốt
// đơn + chính thức "chiếm" ngày đó (chặn đơn khác trùng lịch).
export async function POST(_req: Request, { params }: Params) {
  const { admin, error } = await requireSectionAccess("car-rentals");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "car-rentals", "edit");
  if (permError) return permError;

  const { id } = await params;
  const inquiry = await prisma.rentalInquiry.findUnique({ where: { id } });
  if (!inquiry) return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });
  if (inquiry.depositStatus === "PAID") {
    return NextResponse.json({ error: "Đơn này đã được xác nhận cọc rồi" }, { status: 400 });
  }

  // Hai khach cung chuyen coc cho cung ngay truoc khi don nao duoc chot: don dau chot thanh cong,
  // don sau phai bi chan de admin doi ngay/hoan tien, khong duoc de trung lich.
  const conflict = await hasCarRentalDateConflict(inquiry.placeId, inquiry.pickupDate, inquiry.returnDate, id);
  if (conflict) {
    return NextResponse.json(
      { error: "Đã có đơn khác được xác nhận cọc trùng ngày này. Hãy liên hệ khách để đổi ngày hoặc hoàn tiền cọc." },
      { status: 409 }
    );
  }

  const updated = await prisma.rentalInquiry.update({
    where: { id },
    data: { depositStatus: "PAID", depositPaidAt: new Date() },
  });

  void logAdminAction(admin, "confirm-deposit", "RentalInquiry", id, `${inquiry.customerName} - ${inquiry.depositAmount ?? 0}đ`);

  return NextResponse.json({ item: updated });
}

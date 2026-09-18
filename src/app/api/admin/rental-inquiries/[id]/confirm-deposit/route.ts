import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { checkCarRentalAvailability } from "@/lib/booking-availability";
import { emailDepositConfirmed } from "@/lib/booking-notify";
import { summaryFromRental } from "@/lib/booking-summary";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/rental-inquiries/:id/confirm-deposit - admin kiểm tra tay trong
// app ngân hàng của họ thấy tiền vào đúng mã tham chiếu, rồi bấm nút này để chốt
// đơn + chính thức "chiếm" xe đó (chặn đơn khác vượt quá số xe hiện có).
export async function POST(_req: Request, { params }: Params) {
  const { admin, error } = await requireSectionAccess("car-rentals");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "car-rentals", "edit");
  if (permError) return permError;

  const { id } = await params;
  const inquiry = await prisma.rentalInquiry.findUnique({
    where: { id },
    include: { place: { select: { name: true, totalRooms: true } } },
  });
  if (!inquiry) return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });
  if (inquiry.depositStatus === "PAID") {
    return NextResponse.json({ error: "Đơn này đã được xác nhận cọc rồi" }, { status: 400 });
  }
  if (inquiry.status === "CANCELLED") {
    return NextResponse.json({ error: "Đơn này đã bị huỷ, không thể xác nhận cọc" }, { status: 400 });
  }

  // Nhiều khách cùng chuyển cọc cho cùng ngày trước khi đơn nào được chốt: đơn chốt trước
  // giữ xe, đơn sau bị chặn nếu không còn đủ xe - admin phải đổi ngày/hoàn tiền cho khách.
  const availability = await checkCarRentalAvailability({
    placeId: inquiry.placeId,
    stock: inquiry.place.totalRooms,
    quantity: inquiry.quantity,
    pickupDate: inquiry.pickupDate,
    returnDate: inquiry.returnDate,
    excludeId: id,
  });
  if (!availability.ok) {
    return NextResponse.json(
      { error: `${availability.message}. Hãy liên hệ khách để đổi ngày hoặc hoàn tiền cọc.` },
      { status: 409 }
    );
  }

  const updated = await prisma.rentalInquiry.update({
    where: { id },
    data: { depositStatus: "PAID", depositPaidAt: new Date() },
  });

  void logAdminAction(admin, "confirm-deposit", "RentalInquiry", id, `${inquiry.customerName} - ${inquiry.depositAmount ?? 0}đ`);
  void emailDepositConfirmed(summaryFromRental(inquiry));

  return NextResponse.json({ item: updated });
}

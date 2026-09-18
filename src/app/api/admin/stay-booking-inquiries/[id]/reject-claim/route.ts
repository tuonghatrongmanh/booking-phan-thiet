import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { emailDepositNotFound } from "@/lib/booking-notify";
import { summaryFromStay } from "@/lib/booking-summary";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/stay-booking-inquiries/:id/reject-claim - admin đã kiểm tra ngân hàng và
// CHƯA thấy tiền dù khách bấm "Tôi đã chuyển khoản": gỡ dấu "khách báo đã chuyển", ghi
// nhận lần từ chối (khách chỉ được báo lại vài lần) và báo cho khách biết qua email.
export async function POST(_req: Request, { params }: Params) {
  const { admin, error } = await requireSectionAccess("homestay");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "homestay", "edit");
  if (permError) return permError;

  const { id } = await params;
  const inquiry = await prisma.stayBookingInquiry.findUnique({ where: { id }, include: { place: { select: { name: true } } } });
  if (!inquiry) return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });
  if (inquiry.depositStatus !== "PENDING") {
    return NextResponse.json({ error: "Đơn này không ở trạng thái chờ cọc" }, { status: 400 });
  }
  if (!inquiry.customerReportedPaidAt) {
    return NextResponse.json({ error: "Khách chưa bấm báo đã chuyển khoản" }, { status: 400 });
  }

  const updated = await prisma.stayBookingInquiry.update({
    where: { id },
    data: { customerReportedPaidAt: null, paymentClaimRejectedAt: new Date() },
  });

  void logAdminAction(admin, "reject-deposit-claim", "StayBookingInquiry", id, `${inquiry.customerName} - chưa nhận được tiền`);
  void emailDepositNotFound(summaryFromStay(inquiry));

  return NextResponse.json({ item: updated });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { resolveDateRange } from "@/lib/admin-date-range";
import { toCsv, vnDay } from "@/lib/booking-report";

const DEPOSIT: Record<string, string> = { NONE: "Không cọc", PENDING: "Chờ cọc", PAID: "Đã nhận cọc" };
const STATUS: Record<string, string> = { PENDING: "Mới", CONTACTED: "Đã liên hệ", DONE: "Hoàn tất", CANCELLED: "Đã hủy" };
const day = (d: Date | null) => (d ? vnDay(d) : "");

// GET /api/admin/reports/export?type=stay|rental&range=...  -> CSV các đơn TẠO trong kỳ (mở được bằng Excel).
// Chỉ SuperAdmin: file chứa tên, số điện thoại, email khách và số tiền.
export async function GET(req: NextRequest) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;

  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") === "rental" ? "rental" : "stay";
  const { start, end } = resolveDateRange({ range: sp.get("range") ?? "30d", from: sp.get("from") ?? undefined, to: sp.get("to") ?? undefined });
  const createdAt = { gte: start, lte: end };

  let csv: string;
  if (type === "stay") {
    const rows = await prisma.stayBookingInquiry.findMany({ where: { createdAt }, orderBy: { createdAt: "asc" }, include: { place: { select: { name: true } } }, take: 20000 });
    csv = toCsv(
      ["Mã đơn", "Ngày tạo", "Khách", "Số điện thoại", "Email", "Homestay", "Gói phòng", "Số phòng", "Nhận phòng", "Trả phòng", "Số khách", "Trạng thái", "Tiền cọc (đ)", "Trạng thái cọc", "Ngày nhận cọc", "Mã tham chiếu", "Ghi chú"],
      rows.map((r) => [r.id, day(r.createdAt), r.customerName, r.customerPhone, r.customerEmail, r.place.name, r.optionLabel, r.quantity, day(r.checkinDate), day(r.checkoutDate), r.guestCount, STATUS[r.status] ?? r.status, r.depositAmount, DEPOSIT[r.depositStatus] ?? r.depositStatus, day(r.depositPaidAt), r.depositRef, r.note])
    );
  } else {
    const rows = await prisma.rentalInquiry.findMany({ where: { createdAt }, orderBy: { createdAt: "asc" }, include: { place: { select: { name: true } } }, take: 20000 });
    csv = toCsv(
      ["Mã đơn", "Ngày tạo", "Khách", "Số điện thoại", "Email", "Xe", "Số xe", "Ngày nhận xe", "Ngày trả xe", "Nơi nhận", "Trạng thái", "Tiền cọc (đ)", "Trạng thái cọc", "Ngày nhận cọc", "Mã tham chiếu", "Ghi chú"],
      rows.map((r) => [r.id, day(r.createdAt), r.customerName, r.customerPhone, r.customerEmail, r.place.name, r.quantity, day(r.pickupDate), day(r.returnDate), r.pickupLocation, STATUS[r.status] ?? r.status, r.depositAmount, DEPOSIT[r.depositStatus] ?? r.depositStatus, day(r.depositPaidAt), r.depositRef, r.note])
    );
  }

  void logAdminAction(admin, "export-csv", type === "stay" ? "StayBookingInquiry" : "RentalInquiry", "report", `Xuất CSV ${type === "stay" ? "đặt phòng" : "thuê xe"} ${vnDay(start)} → ${vnDay(end)}`);
  const filename = `${type === "stay" ? "don-dat-phong" : "don-thue-xe"}_${vnDay(start)}_${vnDay(end)}.csv`;
  // BOM (\uFEFF) để Excel đọc đúng tiếng Việt có dấu
  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

import { prisma } from "@/lib/prisma";

// Kiểm tra trùng ngày - CHỈ tính các đơn đã "PAID" (đã nhận cọc thực sự) là thực sự
// chiếm chỗ. Đơn mới gửi/chưa cọc KHÔNG chặn ngày của ai (tránh báo "hết chỗ" oan khi
// đơn đó có thể bị khách bỏ ngang, không bao giờ cọc).

export type AvailabilityResult = { ok: true } | { ok: false; message: string };

// ---------- Thuê xe: theo SỐ LƯỢNG xe cùng mẫu (Place.totalRooms = tổng số xe) ----------

export function evaluateCarAvailability(
  overlapping: { quantity: number }[],
  stock: number,
  quantity: number
): AvailabilityResult {
  const taken = overlapping.reduce((sum, r) => sum + r.quantity, 0);
  const remaining = Math.max(0, stock - taken);
  if (quantity <= remaining) return { ok: true };
  return {
    ok: false,
    message:
      remaining > 0
        ? `Trong khoảng ngày này chỉ còn ${remaining} xe loại này, vui lòng giảm số lượng hoặc chọn ngày khác`
        : "Xe đã có khách đặt cọc giữ chỗ trong khoảng ngày này, vui lòng chọn ngày khác",
  };
}

// Ngày thuê xe tính theo NGÀY nguyên (nhận ngày 20, trả ngày 22 = giữ xe cả 3 ngày, và
// thuê trong ngày: nhận = trả cũng là 1 ngày) nên khoảng ngày là đóng 2 đầu.
export async function checkCarRentalAvailability(params: {
  placeId: string;
  stock: number | null;
  quantity: number;
  pickupDate: Date;
  returnDate: Date;
  excludeId?: string;
}): Promise<AvailabilityResult> {
  const overlapping = await prisma.rentalInquiry.findMany({
    where: {
      placeId: params.placeId,
      depositStatus: "PAID",
      status: { not: "CANCELLED" }, // đơn đã huỷ không còn giữ xe
      id: params.excludeId ? { not: params.excludeId } : undefined,
      pickupDate: { lte: params.returnDate },
      returnDate: { gte: params.pickupDate },
    },
    select: { quantity: true },
  });
  return evaluateCarAvailability(overlapping, Math.max(1, params.stock ?? 1), params.quantity);
}

// ---------- Homestay: theo GÓI phòng (phòng đơn/đôi/nguyên căn...) ----------

export type StayOptionLite = { id: string; maxUnits: number; wholeProperty: boolean };
export type PaidStayRow = { optionId: string | null; optionLabel: string | null; optionWhole: boolean; quantity: number };

// option = null: đơn kiểu cũ/chưa có gói nào -> coi như đặt cả chỗ ở (chặn mọi đơn trùng).
// Đơn cũ (không có gói: optionLabel null) cũng được coi là đặt cả chỗ ở.
export function evaluateStayAvailability(
  overlapping: PaidStayRow[],
  option: StayOptionLite | null,
  quantity: number
): AvailabilityResult {
  const whole = "Chỗ ở đã có khách đặt cọc giữ chỗ trong khoảng ngày này, vui lòng chọn ngày khác";

  if (!option || option.wholeProperty) {
    return overlapping.length > 0 ? { ok: false, message: whole } : { ok: true };
  }
  if (overlapping.some((r) => r.optionWhole || (r.optionId === null && r.optionLabel === null))) {
    return { ok: false, message: whole };
  }
  const taken = overlapping.filter((r) => r.optionId === option.id).reduce((sum, r) => sum + r.quantity, 0);
  const remaining = Math.max(0, option.maxUnits - taken);
  if (quantity <= remaining) return { ok: true };
  return {
    ok: false,
    message:
      remaining > 0
        ? `Trong khoảng ngày này chỉ còn ${remaining} phòng loại này, vui lòng giảm số phòng hoặc chọn ngày khác`
        : "Loại phòng này đã hết trong khoảng ngày này, vui lòng chọn loại khác hoặc ngày khác",
  };
}

// Đêm ở tính nửa khoảng: khách trước trả phòng ngày 22 thì khách sau nhận phòng ngày 22 được.
export async function checkStayAvailability(params: {
  placeId: string;
  option: StayOptionLite | null;
  quantity: number;
  checkinDate: Date;
  checkoutDate: Date;
  excludeId?: string;
}): Promise<AvailabilityResult> {
  const overlapping = await prisma.stayBookingInquiry.findMany({
    where: {
      placeId: params.placeId,
      depositStatus: "PAID",
      status: { not: "CANCELLED" }, // đơn đã huỷ không còn giữ phòng
      id: params.excludeId ? { not: params.excludeId } : undefined,
      checkinDate: { lt: params.checkoutDate },
      checkoutDate: { gt: params.checkinDate },
    },
    select: { optionId: true, optionLabel: true, optionWhole: true, quantity: true },
  });
  return evaluateStayAvailability(overlapping, params.option, params.quantity);
}

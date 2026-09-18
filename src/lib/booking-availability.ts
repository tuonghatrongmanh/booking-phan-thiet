import { prisma } from "@/lib/prisma";

// Kiểm tra trùng ngày - CHỈ tính các đơn đã "PAID" (đã nhận cọc thực sự) là thực sự
// chiếm ngày đó. Đơn mới gửi/chưa cọc KHÔNG chặn ngày của ai (tránh báo "hết chỗ"
// oan khi đơn đó có thể bị khách bỏ ngang, không bao giờ cọc).
export async function hasCarRentalDateConflict(
  placeId: string,
  pickupDate: Date,
  returnDate: Date,
  excludeId?: string
): Promise<boolean> {
  const conflict = await prisma.rentalInquiry.findFirst({
    where: {
      placeId,
      depositStatus: "PAID",
      id: excludeId ? { not: excludeId } : undefined,
      pickupDate: { lt: returnDate },
      returnDate: { gt: pickupDate },
    },
    select: { id: true },
  });
  return Boolean(conflict);
}

export async function hasStayDateConflict(
  placeId: string,
  checkinDate: Date,
  checkoutDate: Date,
  excludeId?: string
): Promise<boolean> {
  const conflict = await prisma.stayBookingInquiry.findFirst({
    where: {
      placeId,
      depositStatus: "PAID",
      id: excludeId ? { not: excludeId } : undefined,
      checkinDate: { lt: checkoutDate },
      checkoutDate: { gt: checkinDate },
    },
    select: { id: true },
  });
  return Boolean(conflict);
}

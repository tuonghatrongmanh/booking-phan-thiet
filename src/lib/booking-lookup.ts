import { prisma } from "@/lib/prisma";
import type { RentalInquiry, StayBookingInquiry } from "@prisma/client";

// Tra cứu đơn bằng "mã đơn" (depositRef, vd BPTK3M9QX - có trong nội dung chuyển khoản
// và email) + số điện thoại đã đặt. Cần CẢ HAI nên không thể đoán mò đơn của người khác
// (mã 6 ký tự ngẫu nhiên, lại có giới hạn số lần thử theo IP ở API).

export type FoundBooking =
  | { kind: "rental"; record: RentalInquiry & { place: { name: string } } }
  | { kind: "stay"; record: StayBookingInquiry & { place: { name: string } } };

export function normalizeRef(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export async function findBookingByRef(ref: string, phone: string): Promise<FoundBooking | null> {
  const code = normalizeRef(ref);
  const digits = phone.trim();
  if (!/^BPT[A-Z0-9]{6}$/.test(code) || !/^0\d{9}$/.test(digits)) return null;

  const rental = await prisma.rentalInquiry.findUnique({
    where: { depositRef: code },
    include: { place: { select: { name: true } } },
  });
  if (rental) return rental.customerPhone === digits ? { kind: "rental", record: rental } : null;

  const stay = await prisma.stayBookingInquiry.findUnique({
    where: { depositRef: code },
    include: { place: { select: { name: true } } },
  });
  if (stay && stay.customerPhone === digits) return { kind: "stay", record: stay };
  return null;
}

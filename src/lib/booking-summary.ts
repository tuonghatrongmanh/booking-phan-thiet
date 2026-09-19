import type { RentalInquiry, StayBookingInquiry } from "@prisma/client";
import { formatBookingDate, type BookingSummary } from "@/lib/booking-notify";

// Dựng BookingSummary (dùng cho email/Telegram) từ bản ghi đơn trong DB.

export function summaryFromRental(r: RentalInquiry & { place: { name: string } }): BookingSummary {
  return {
    id: r.id,
    kind: "rental",
    placeName: r.place.name,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    customerEmail: r.customerEmail,
    dateText: `${formatBookingDate(r.pickupDate)} → ${formatBookingDate(r.returnDate)}`,
    detailText: `${r.quantity} xe`,
    depositAmount: r.depositAmount,
    depositRef: r.depositRef,
  };
}

export function summaryFromStay(s: StayBookingInquiry & { place: { name: string } }): BookingSummary {
  return {
    id: s.id,
    kind: "stay",
    placeName: s.place.name,
    customerName: s.customerName,
    customerPhone: s.customerPhone,
    customerEmail: s.customerEmail,
    dateText: `${formatBookingDate(s.checkinDate)} → ${formatBookingDate(s.checkoutDate)}`,
    detailText: s.optionLabel ? (s.optionWhole ? s.optionLabel : `${s.optionLabel} x ${s.quantity}`) : null,
    depositAmount: s.depositAmount,
    depositRef: s.depositRef,
  };
}

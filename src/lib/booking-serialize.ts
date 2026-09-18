import type { PaymentSettingsData } from "@/lib/payment-settings";
import type { FoundBooking } from "@/lib/booking-lookup";
import { buildDepositInfo, canTakeDeposit, type DepositInfoPayload } from "@/lib/booking-deposit";
import { formatBookingDate } from "@/lib/booking-notify";
import { checkCanReportPaid, isDepositExpired } from "@/lib/booking-status";

// Dạng dữ liệu đơn trả cho khách (tra cứu bằng mã + SĐT, hoặc danh sách đơn của tài khoản
// đang đăng nhập) - chỉ những trường khách được phép thấy.
export type PublicBooking = {
  kind: "stay" | "rental";
  placeName: string;
  dateText: string;
  detailText: string | null;
  customerName: string;
  customerPhone: string;
  status: "PENDING" | "CONTACTED" | "DONE" | "CANCELLED";
  depositStatus: "NONE" | "PENDING" | "PAID";
  depositAmount: number | null;
  depositRef: string | null;
  depositPaidAt: Date | null;
  createdAt: Date;
  expired: boolean;
  reportedPaid: boolean;
  claimRejected: boolean;
  canReport: boolean;
  reportBlockedReason: string | null;
  deposit: DepositInfoPayload | null;
};

export function serializeBooking(found: FoundBooking, settings: PaymentSettingsData): PublicBooking {
  const r = found.record;
  const isRental = found.kind === "rental";

  const pending = r.depositStatus === "PENDING" && r.status !== "CANCELLED" && r.depositRef && r.depositAmount;
  const claim = checkCanReportPaid(r);

  return {
    kind: found.kind,
    placeName: r.place.name,
    dateText: isRental
      ? `${formatBookingDate(found.record.pickupDate)} → ${formatBookingDate(found.record.returnDate)}`
      : `${formatBookingDate(found.record.checkinDate)} → ${formatBookingDate(found.record.checkoutDate)}`,
    detailText: isRental
      ? `${found.record.quantity} xe`
      : found.record.optionLabel
        ? found.record.optionWhole
          ? found.record.optionLabel
          : `${found.record.optionLabel} x ${found.record.quantity}`
        : null,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    status: r.status,
    depositStatus: r.depositStatus,
    depositAmount: r.depositAmount,
    depositRef: r.depositRef,
    depositPaidAt: r.depositPaidAt,
    createdAt: r.createdAt,
    expired: r.depositStatus === "PENDING" && isDepositExpired(r.createdAt),
    reportedPaid: Boolean(r.customerReportedPaidAt),
    claimRejected: Boolean(r.paymentClaimRejectedAt) && !r.customerReportedPaidAt,
    canReport: Boolean(pending) && claim.ok,
    reportBlockedReason: pending && !claim.ok ? claim.reason : null,
    deposit: pending && canTakeDeposit(settings) ? buildDepositInfo(settings, r.depositRef!, r.depositAmount!) : null,
  };
}

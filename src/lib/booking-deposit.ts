import type { PaymentSettingsData } from "@/lib/payment-settings";
import { buildVietQrImageUrl } from "@/lib/vietqr";

// Tiền cọc luôn được TÍNH Ở SERVER (không tin số tiền client gửi lên):
//  - Thuê xe: cọc mỗi xe (Place.depositVnd, hoặc mặc định trong Cài đặt) x số xe khách đặt
//  - Homestay: cọc của gói phòng khách chọn x số phòng; nếu chỗ ở chưa có gói nào thì
//    dùng cọc cả chỗ ở (Place.depositVnd) hoặc mặc định trong Cài đặt

export function computeCarDeposit(p: {
  placeDepositVnd: number | null;
  defaultDepositVnd: number;
  quantity: number;
}): number {
  return (p.placeDepositVnd ?? p.defaultDepositVnd) * p.quantity;
}

export function computeStayDeposit(p: {
  optionDepositVnd: number | null;
  placeDepositVnd: number | null;
  defaultDepositVnd: number;
  quantity: number;
}): number {
  if (p.optionDepositVnd != null) return p.optionDepositVnd * p.quantity;
  return p.placeDepositVnd ?? p.defaultDepositVnd;
}

export function canTakeDeposit(settings: PaymentSettingsData): boolean {
  return Boolean(settings.bankBin && settings.bankAccountNumber);
}

export type DepositInfoPayload = {
  amount: number;
  ref: string;
  qrImageUrl: string;
  bankLabel: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
};

export function buildDepositInfo(settings: PaymentSettingsData, ref: string, amount: number): DepositInfoPayload {
  return {
    amount,
    ref,
    qrImageUrl: buildVietQrImageUrl({
      bankBin: settings.bankBin!,
      accountNumber: settings.bankAccountNumber!,
      accountName: settings.bankAccountName ?? "",
      amount,
      message: ref,
    }),
    bankLabel: settings.bankLabel,
    bankAccountNumber: settings.bankAccountNumber,
    bankAccountName: settings.bankAccountName,
  };
}

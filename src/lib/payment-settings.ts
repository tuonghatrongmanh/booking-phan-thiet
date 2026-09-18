import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export type PaymentSettingsData = {
  bankBin: string | null;
  bankLabel: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  depositAmountVnd: number;
};

// Đọc cấu hình tài khoản nhận cọc - null cho bankBin/bankAccountNumber nghĩa là
// admin CHƯA cấu hình, lúc đó không tạo QR được (xem các API đặt cọc, trả lỗi rõ
// ràng thay vì tạo QR sai/rỗng).
export async function getPaymentSettings(): Promise<PaymentSettingsData> {
  const row = await prisma.paymentSettings.findUnique({ where: { id: SETTINGS_ID } }).catch(() => null);
  return {
    bankBin: row?.bankBin ?? null,
    bankLabel: row?.bankLabel ?? null,
    bankAccountNumber: row?.bankAccountNumber ?? null,
    bankAccountName: row?.bankAccountName ?? null,
    depositAmountVnd: row?.depositAmountVnd ?? 100_000,
  };
}

export async function updatePaymentSettings(data: Partial<PaymentSettingsData>) {
  return prisma.paymentSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}

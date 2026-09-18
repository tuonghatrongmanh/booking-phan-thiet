import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-action";
import { getPaymentSettings, updatePaymentSettings } from "@/lib/payment-settings";
import { BANK_OPTIONS, bankLabelForBin } from "@/lib/vietqr";
import { logAdminAction } from "@/lib/audit-log";
import { z } from "zod";

const schema = z.object({
  bankBin: z.string().trim().refine((v) => BANK_OPTIONS.some((b) => b.bin === v), "Ngân hàng không hợp lệ"),
  bankAccountNumber: z.string().trim().regex(/^\d{6,20}$/, "Số tài khoản chỉ gồm 6-20 chữ số"),
  bankAccountName: z
    .string()
    .trim()
    .regex(/^[A-Z0-9 ]{2,50}$/, "Tên chủ tài khoản viết HOA, không dấu (VD: NGUYEN VAN A)"),
  depositAmountVnd: z.number().int().min(10_000, "Tiền cọc tối thiểu 10.000đ").max(50_000_000, "Tiền cọc tối đa 50.000.000đ"),
});

// GET/PATCH /api/admin/payment-settings - thông tin tài khoản ngân hàng nhận cọc,
// dùng để tạo VietQR cho đơn đặt phòng/thuê xe. Chỉ SUPER_ADMIN được sửa (thông tin
// tài chính nhạy cảm).
export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;
  const settings = await getPaymentSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Chỉ SuperAdmin mới có quyền sửa thông tin nhận cọc" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const updated = await updatePaymentSettings({
    ...parsed.data,
    bankLabel: bankLabelForBin(parsed.data.bankBin),
  });

  void logAdminAction(
    admin,
    "update-payment-settings",
    "PaymentSettings",
    "singleton",
    `${updated.bankLabel ?? updated.bankBin} - ${updated.bankAccountNumber} - cọc ${updated.depositAmountVnd}đ`
  );

  return NextResponse.json(updated);
}

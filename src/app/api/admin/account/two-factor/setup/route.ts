import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-action";
import { generateTwoFactorSecret, buildTwoFactorQrDataUrl } from "@/lib/two-factor";

// POST /api/admin/account/two-factor/setup - sinh 1 secret TOTP mới và trả về QR để
// admin scan bằng Google Authenticator. Secret CHƯA được lưu vào DB ở bước này - chỉ
// lưu sau khi /confirm xác nhận admin đã nhập đúng 1 mã từ app của họ.
export async function POST() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const secret = generateTwoFactorSecret();
  const qrDataUrl = await buildTwoFactorQrDataUrl(admin.email, secret);

  return NextResponse.json({ secret, qrDataUrl });
}

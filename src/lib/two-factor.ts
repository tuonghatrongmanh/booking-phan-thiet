import { authenticator } from "otplib";
import QRCode from "qrcode";

const ISSUER = "Booking Phan Thiet Admin";

// Sinh 1 secret TOTP mới (chưa lưu vào DB - chỉ lưu SAU KHI admin xác minh đúng 1 mã
// trong lúc kích hoạt, xem AdminAccountForm.tsx).
export function generateTwoFactorSecret(): string {
  return authenticator.generateSecret();
}

export function buildTwoFactorQrDataUrl(email: string, secret: string): Promise<string> {
  const uri = authenticator.keyuri(email, ISSUER, secret);
  return QRCode.toDataURL(uri);
}

export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

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

// Chấp nhận mã của bước 30 giây liền trước/liền sau (window = 1) - chuẩn của hầu hết dịch
// vụ dùng TOTP. Với window mặc định = 0, mã chỉ đúng trong ĐÚNG 30 giây hiện tại nên gõ
// chậm vài giây, hoặc đồng hồ điện thoại lệch vài giây, là bị báo sai dù mã đúng.
const tolerantAuthenticator = authenticator.clone({ window: 1 });
const diagnosticAuthenticator = authenticator.clone({ window: 20 });

export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    return tolerantAuthenticator.verify({ token: token.replace(/\s/g, ""), secret });
  } catch {
    return false;
  }
}

// CHỈ để ghi log phía server khi đăng nhập sai mã: trả về mã đang lệch bao nhiêu bước 30
// giây so với đồng hồ server (khớp trong ±10 phút), hoặc null nếu không khớp mã nào (nhầm
// mục trong app / sai secret). Không bao giờ trả kết quả này cho trình duyệt.
export function getTwoFactorClockDelta(token: string, secret: string): number | null {
  try {
    return diagnosticAuthenticator.checkDelta(token.replace(/\s/g, ""), secret);
  } catch {
    return null;
  }
}

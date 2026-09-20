// Phần thuần của mã giới thiệu Sale (không đụng DB, dễ test).
export const REF_COOKIE = "bpt_ref";
export const REF_COOKIE_DAYS = 30;
export const DEFAULT_COMMISSION_PERCENT = 5;

// Bỏ các ký tự dễ nhầm (0/O, 1/I) để Sale đọc mã qua điện thoại không bị sai
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const REF_RE = /^[A-Z0-9]{6,10}$/;

export function generateReferralCode(length = 7): string {
  let out = "";
  // globalThis.crypto có sẵn cả ở Node và trình duyệt -> file này dùng được ở client (không import 'crypto' của Node)
  const buf = new Uint32Array(length);
  globalThis.crypto.getRandomValues(buf);
  for (let i = 0; i < length; i++) out += ALPHABET[buf[i] % ALPHABET.length];
  return out;
}

export function normalizeRefCode(raw: string | null | undefined): string | null {
  const code = (raw ?? "").trim().toUpperCase();
  return REF_RE.test(code) ? code : null;
}

// Tỉ lệ áp dụng cho 1 Sale: mức riêng (nếu admin đặt) hoặc mức chung. 0% là giá trị hợp lệ (Sale không nhận hoa hồng).
export function effectivePercent(override: number | null | undefined, globalPercent: number): number {
  return typeof override === "number" && Number.isFinite(override) ? override : globalPercent;
}

export function computeCommission(depositAmount: number, percent: number): number {
  if (!Number.isFinite(depositAmount) || depositAmount <= 0 || percent <= 0) return 0;
  return Math.round((depositAmount * percent) / 100);
}

// "Nguyễn Văn An" -> "Nguyễn V. A." (Sale chỉ thấy tên đã rút gọn của khách được mình giới thiệu)
export function maskName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ? `${parts[0][0]}***` : "Khách";
  return [parts[0], ...parts.slice(1).map((p) => `${p[0].toUpperCase()}.`)].join(" ");
}

export function referralLink(siteUrl: string, code: string): string {
  return `${siteUrl.replace(/\/$/, "")}/?ref=${code}`;
}

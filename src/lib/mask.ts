// Che thong tin ca nhan tren man hinh ho so (tranh nguoi ben canh/chup man hinh nhin thay).
const DOT = "•";

export function maskPhone(phone: string): string {
  const d = phone.trim();
  if (d.length <= 5) return DOT.repeat(d.length);
  return d.slice(0, 3) + DOT.repeat(d.length - 5) + d.slice(-2);
}

export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return DOT.repeat(Math.min(email.length, 8));
  const local = email.slice(0, at);
  return local.slice(0, 1) + DOT.repeat(Math.max(3, local.length - 1)) + email.slice(at);
}

export const MASKED_DATE = "••/••/••••";

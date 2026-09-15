import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Mat khau chu - chi SUPER_ADMIN biet, dung de gac cong truoc cac hanh dong nhay cam
// (dat lai mat khau Sale/Nhan vien). Luu hash mot chieu, khong ai xem lai duoc gia
// tri goc kha ca khi doc thang database.
export async function verifyMasterPassword(candidate: string): Promise<boolean> {
  if (!candidate) return false;
  const settings = await prisma.securitySettings.findUnique({ where: { id: "singleton" } });
  if (!settings) return false;
  return bcrypt.compare(candidate, settings.masterPasswordHash);
}

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";

export function generateRandomPassword(length = 10): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)];
  }
  return out;
}

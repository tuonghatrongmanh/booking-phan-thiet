import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-log";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

// POST /api/auth/reset-password - đổi mật khẩu bằng token nhận từ email (xem
// /api/auth/forgot-password). Token chỉ dùng 1 lần, hết hạn sau 1 giờ.
export async function POST(req: NextRequest) {
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  if (!rateLimit(`reset-password:${ip}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: "Bạn thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { token, password } = parsed.data;

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return NextResponse.json({ message: "Đặt lại mật khẩu thành công" });
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRateLimited, recordFailure } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_WINDOW_MS = 5 * 60_000;

// POST /api/admin/login-precheck - kiểm tra email/mật khẩu TRƯỚC khi hỏi mã 2FA (nếu
// tài khoản có bật), KHÔNG tạo session ở đây - chỉ để trang đăng nhập biết có cần
// hiện thêm ô nhập mã OTP hay không. Dùng chung khóa rate-limit với authorize() trong
// auth.ts và CHỈ đếm lần thất bại, nên đăng nhập đúng không tốn lượt nào.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Thiếu email/mật khẩu" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const limiterKey = `login-admin:${email}`;
  if (isRateLimited(limiterKey, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS)) {
    return NextResponse.json({ error: "Bạn thử quá nhiều lần, vui lòng thử lại sau" }, { status: 429 });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !admin.active) {
    recordFailure(limiterKey);
    return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
  }

  const valid = await bcrypt.compare(parsed.data.password, admin.password);
  if (!valid) {
    recordFailure(limiterKey);
    return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
  }

  return NextResponse.json({ requiresTwoFactor: admin.twoFactorEnabled });
}

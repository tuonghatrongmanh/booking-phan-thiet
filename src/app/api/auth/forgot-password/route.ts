import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-log";
import { sendMail } from "@/lib/mailer";
import { z } from "zod";

const schema = z.object({ email: z.string().trim().email() });

const TOKEN_TTL_MS = 60 * 60_000;

// POST /api/auth/forgot-password - luôn trả về cùng 1 thông báo chung dù email có
// tồn tại hay không (chống dò email trong hệ thống). Nếu gọi "quên-mật-khẩu" này
// thành công về mặt lưu token, nhưng sendMail() không gửi được thực sự (chưa có
// RESEND_API_KEY), yêu cầu vẫn được lưu để admin thấy và hỗ trợ thủ công ở trang
// /admin/password-reset-requests.
export async function POST(req: NextRequest) {
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  if (!rateLimit(`forgot-password:${ip}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: "Bạn thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  if (!rateLimit(`forgot-password-email:${email}`, 3, 15 * 60_000)) {
    return NextResponse.json({ error: "Bạn thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const GENERIC_OK = NextResponse.json({
    message: "Nếu email này tồn tại trong hệ thống, một liên kết đặt lại mật khẩu đã được gửi tới.",
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.hidden) return GENERIC_OK;

  if (!user.password) {
    // Tài khoản chỉ đăng nhập bằng Google - không có mật khẩu để "quên", không tạo token.
    return GENERIC_OK;
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dat-lai-mat-khau?token=${token}`;
  await sendMail({
    to: user.email,
    subject: "Đặt lại mật khẩu - Booking Phan Thiết",
    html: `
      <p>Xin chào ${user.name},</p>
      <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản Booking Phan Thiết.</p>
      <p><a href="${resetUrl}">Bấm vào đây để đặt lại mật khẩu</a> (liên kết hết hạn sau 1 giờ).</p>
      <p>Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>
    `,
  });

  return GENERIC_OK;
}

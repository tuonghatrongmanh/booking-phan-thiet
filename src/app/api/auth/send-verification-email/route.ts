import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mailer";

const TOKEN_TTL_MS = 24 * 60 * 60_000;

// POST /api/auth/send-verification-email - người dùng đăng nhập bấm "Gửi lại email
// xác thực" ở trang tài khoản. Cũng được gọi (fire-and-forget) ngay sau khi đăng ký
// tài khoản mới.
export async function POST(req: NextRequest) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  if (!rateLimit(`send-verify-email:${actor.id}`, 3, 15 * 60_000)) {
    return NextResponse.json({ error: "Bạn thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { id: actor.id } });
  if (!user) return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
  if (user.emailVerifiedAt) return NextResponse.json({ message: "Email đã được xác thực" });

  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const verifyUrl = `${req.nextUrl.origin}/xac-thuc-email?token=${token}`;
  const result = await sendMail({
    to: user.email,
    subject: "Xác thực email - Booking Phan Thiết",
    html: `
      <p>Xin chào ${user.name},</p>
      <p>Bấm vào liên kết bên dưới để xác thực email cho tài khoản Booking Phan Thiết:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Liên kết hết hạn sau 24 giờ.</p>
    `,
  });

  return NextResponse.json({ message: "Đã gửi email xác thực (nếu hệ thống đã cấu hình gửi mail)", sent: result.sent });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-log";
import { z } from "zod";

const schema = z.object({ token: z.string().min(1) });

// POST /api/auth/verify-email - người dùng bấm nút xác nhận trên trang
// /xác-thực-email (KHÔNG tự động xác nhận khi trang vừa load, vì một số trình đọc
// email/bot quét liên kết trước sẽ vô tình "dùng" token hộ trước khi người dùng
// thực sự bấm vào).
export async function POST(req: NextRequest) {
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  if (!rateLimit(`verify-email:${ip}`, 20, 15 * 60_000)) {
    return NextResponse.json({ error: "Bạn thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const record = await prisma.emailVerificationToken.findUnique({ where: { token: parsed.data.token } });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Liên kết xác thực không hợp lệ hoặc đã hết hạn" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return NextResponse.json({ message: "Xác thực email thành công" });
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-log";

// Gioi han theo IP - chan spam tao hang loat tai khoan tu 1 nguon (bot dang ky) ma
// khong anh huong nguoi dung that (10 lan/gio la du rong cho ho gia dinh dung chung mang).
export async function POST(req: Request) {
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  if (!rateLimit(`register:${ip}`, 10, 60 * 60_000)) {
    return NextResponse.json({ error: "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { name, phone, dob, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (existing) {
    return NextResponse.json(
      { error: existing.email === email ? "Email đã được sử dụng" : "Số điện thoại đã được sử dụng" },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, phone, email, dob: new Date(dob), password: hashed },
  });

  return NextResponse.json({ id: user.id, email: user.email });
}

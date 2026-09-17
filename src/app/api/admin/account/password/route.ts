import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
});

// POST /api/admin/account/password - admin tự đổi mật khẩu của CHÍNH mình, phải
// nhập đúng mật khẩu hiện tại (khác với reset-password mà SuperAdmin làm hộ người
// khác qua master password).
export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  if (!rateLimit(`admin-change-password:${admin.id}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: "Bạn thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, admin.password);
  if (!valid) {
    return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 403 });
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.admin.update({ where: { id: admin.id }, data: { password: hash } });

  return NextResponse.json({ message: "Đổi mật khẩu thành công" });
}

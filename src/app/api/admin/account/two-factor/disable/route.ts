import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { z } from "zod";

const schema = z.object({ currentPassword: z.string().min(1) });

// POST /api/admin/account/two-factor/disable - tắt 2FA cho CHÍNH admin đang đăng
// nhập, phải nhập đúng mật khẩu hiện tại để xác nhận (giống đổi mật khẩu).
export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vui lòng nhập mật khẩu hiện tại" }, { status: 400 });
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, admin.password);
  if (!valid) {
    return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 403 });
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  void logAdminAction(admin, "disable-2fa", "Admin", admin.id);

  return NextResponse.json({ ok: true });
}

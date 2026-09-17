import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";
import { verifyMasterPassword, generateRandomPassword } from "@/lib/security-gate";
import { logAdminAction } from "@/lib/audit-log";
import { z } from "zod";

const schema = z.object({ masterPassword: z.string() });

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/users/[id]/reset-password - SuperAdmin dat lai mat khau cho 1 User
// (dung cho Sale uy tin). Khong the "xem lai" mat khau cu (bcrypt khong the giai ma
// nguoc) - day la giai phap an toan tuong duong: sinh mat khau moi, tra ve MOT LAN
// duy nhat de SuperAdmin bao lai cho tai khoan do.
export async function POST(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Chỉ SuperAdmin mới có quyền này" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Thiếu mật khẩu chủ" }, { status: 400 });

  const ok = await verifyMasterPassword(parsed.data.masterPassword);
  if (!ok) return NextResponse.json({ error: "Mật khẩu chủ không đúng" }, { status: 403 });

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const newPassword = generateRandomPassword();
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id }, data: { password: hash } });

  void logAdminAction(admin, "reset-password", "User", id, `Đặt lại mật khẩu cho ${user.name} (${user.email})`);

  return NextResponse.json({ newPassword });
}

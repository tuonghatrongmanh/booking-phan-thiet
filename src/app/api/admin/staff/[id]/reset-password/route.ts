import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";
import { verifyMasterPassword, generateRandomPassword } from "@/lib/security-gate";
import { logAdminAction } from "@/lib/audit-log";
import { z } from "zod";

const schema = z.object({ masterPassword: z.string() });

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/staff/[id]/reset-password - tuong tu users/[id]/reset-password
// nhung danh cho tai khoan Admin (nhan vien).
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
  const target = await prisma.admin.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  if (target.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Không thể đặt lại mật khẩu tài khoản SuperAdmin khác" }, { status: 403 });
  }

  const newPassword = generateRandomPassword();
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.admin.update({ where: { id }, data: { password: hash } });

  void logAdminAction(admin, "reset-password", "Admin", id, `Đặt lại mật khẩu cho ${target.name} (${target.email})`);

  return NextResponse.json({ newPassword });
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";
import { verifyMasterPassword } from "@/lib/security-gate";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Mật khẩu chủ phải có ít nhất 8 ký tự"),
});

// POST /api/admin/security-gate - SuperAdmin doi mat khau chu. Neu da co 1 dong roi
// thi bat buoc dung currentPassword de xac nhan truoc khi doi.
export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Chỉ SuperAdmin mới có quyền này" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.securitySettings.findUnique({ where: { id: "singleton" } });
  if (existing) {
    const ok = await verifyMasterPassword(parsed.data.currentPassword ?? "");
    if (!ok) return NextResponse.json({ error: "Mật khẩu chủ hiện tại không đúng" }, { status: 403 });
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.securitySettings.upsert({
    where: { id: "singleton" },
    update: { masterPasswordHash: hash },
    create: { id: "singleton", masterPasswordHash: hash },
  });

  return NextResponse.json({ ok: true });
}

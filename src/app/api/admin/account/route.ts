import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự").max(100),
});

// GET/PATCH /api/admin/account - thông tin & cập nhật tên của CHÍNH admin đang
// đăng nhập (không phải quản lý nhân viên khác - đó là /api/admin/staff).
export async function GET() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  return NextResponse.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role });
}

export async function PATCH(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const updated = await prisma.admin.update({ where: { id: admin.id }, data: { name: parsed.data.name } });
  return NextResponse.json({ id: updated.id, name: updated.name });
}

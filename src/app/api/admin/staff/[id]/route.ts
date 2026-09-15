import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  active: z.boolean().optional(),
  name: z.string().trim().min(2).optional(),
  password: z.string().min(6).optional(),
  permissions: z.record(z.string(), z.any()).optional(),
});

async function requireSuperAdmin() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return { admin: null, error: error! };
  if (admin.role !== "SUPER_ADMIN") {
    return { admin: null, error: NextResponse.json({ error: "Chỉ quản trị viên cấp cao mới có quyền này" }, { status: 403 }) };
  }
  return { admin, error: null };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  const admin = await prisma.admin.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, active: true, permissions: true, lastLoginAt: true, createdAt: true },
  });
  if (!admin) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(admin);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  const target = await prisma.admin.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  if (target.role === "SUPER_ADMIN") {
    return NextResponse.json({ error: "Không thể chỉnh sửa tài khoản quản trị cấp cao khác" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Thông tin không hợp lệ" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (parsed.data.active !== undefined) data.active = parsed.data.active;
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.permissions) data.permissions = parsed.data.permissions;
  if (parsed.data.password) data.password = await bcrypt.hash(parsed.data.password, 10);

  const admin = await prisma.admin.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, active: true, permissions: true },
  });
  return NextResponse.json(admin);
}

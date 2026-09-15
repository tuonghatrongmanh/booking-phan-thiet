import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";
import { DEFAULT_STAFF_PERMISSIONS } from "@/lib/admin-permissions";

const createSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().min(3),
  password: z.string().min(6),
});

// Chi SUPER_ADMIN moi duoc xem/tao danh sach nhan vien - kiem tra thang role, khong
// dung requireSectionAccess() vi "staff" khong phai 1 section co the cap cho EDITOR.
async function requireSuperAdmin() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return { admin: null, error: error! };
  if (admin.role !== "SUPER_ADMIN") {
    return { admin: null, error: NextResponse.json({ error: "Chỉ quản trị viên cấp cao mới có quyền này" }, { status: 403 }) };
  }
  return { admin, error: null };
}

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const staff = await prisma.admin.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, createdAt: true },
  });
  return NextResponse.json({ items: staff });
}

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Thông tin không hợp lệ" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email này đã được sử dụng" }, { status: 400 });

  const hash = await bcrypt.hash(parsed.data.password, 10);
  const admin = await prisma.admin.create({
    data: {
      name: parsed.data.name,
      email,
      password: hash,
      role: "EDITOR",
      permissions: DEFAULT_STAFF_PERMISSIONS,
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  return NextResponse.json(admin, { status: 201 });
}

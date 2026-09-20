import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { z } from "zod";

const updateSchema = z.object({ hidden: z.boolean() });

type Params = { params: Promise<{ id: string }> };

// PATCH - dung de an/hien tai khoan (thay the cho xoa - giu nguyen du lieu bai
// viet/binh luan, chi chan dang nhap va danh dau an trong danh sach quan tri).
export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({ where: { id }, data: { hidden: parsed.data.hidden } });
    const { password: _password, ...safe } = user;
    void _password;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  const { password: _password, ...safe } = user;
  void _password;
  return NextResponse.json(safe);
}

// Xoa tai khoan (vd spam/vi pham) - cascade xoa luon bai viet/binh luan/reaction cua
// nguoi nay tren dien dan (da khai bao onDelete: Cascade trong schema).
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

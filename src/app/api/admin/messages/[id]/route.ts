import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/messages/[id] - nguoi nhan tu danh dau da doc (chi duoc doi tin
// nhan CUA CHINH MINH, khong cho sua noi dung).
export async function PATCH(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const message = await prisma.adminMessage.findUnique({ where: { id } });
  if (!message || message.toAdminId !== admin.id) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  const updated = await prisma.adminMessage.update({ where: { id }, data: { read: true } });
  return NextResponse.json(updated);
}

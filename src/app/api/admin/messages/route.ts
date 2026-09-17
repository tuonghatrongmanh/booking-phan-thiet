import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";
import { z } from "zod";

// GET /api/admin/messages - hop thu den cua admin dang dang nhap (moi role deu xem
// duoc tin nhan gui rieng cho minh).
export async function GET() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const messages = await prisma.adminMessage.findMany({
    where: { toAdminId: admin.id },
    orderBy: { createdAt: "desc" },
    include: { fromAdmin: { select: { name: true } } },
  });
  return NextResponse.json(messages);
}

const sendSchema = z.object({
  toAdminId: z.string().min(1),
  message: z.string().trim().min(1).max(2000),
});

// POST /api/admin/messages - chi SuperAdmin duoc gui tin nhan rieng cho 1 nhan vien.
export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Chỉ SuperAdmin mới có quyền gửi tin nhắn" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const target = await prisma.admin.findUnique({ where: { id: parsed.data.toAdminId } });
  if (!target) return NextResponse.json({ error: "Không tìm thấy nhân viên" }, { status: 404 });

  const created = await prisma.adminMessage.create({
    data: { fromAdminId: admin.id, toAdminId: parsed.data.toAdminId, message: parsed.data.message },
  });
  return NextResponse.json(created, { status: 201 });
}

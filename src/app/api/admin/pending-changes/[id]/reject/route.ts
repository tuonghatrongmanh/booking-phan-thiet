import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";

type Params = { params: Promise<{ id: string }> };

const rejectSchema = z.object({ reviewNote: z.string().trim().max(500).optional() });

async function requireSuperAdmin() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return { admin: null, error: error! };
  if (admin.role !== "SUPER_ADMIN") {
    return { admin: null, error: NextResponse.json({ error: "Chỉ quản trị viên cấp cao mới có quyền này" }, { status: 403 }) };
  }
  return { admin, error: null };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error;

  const { id } = await params;
  const change = await prisma.pendingChange.findUnique({ where: { id } });
  if (!change) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  if (change.status !== "PENDING") return NextResponse.json({ error: "Yêu cầu này đã được xử lý" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const parsed = rejectSchema.safeParse(body);

  const updated = await prisma.pendingChange.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedById: admin.id,
      reviewedAt: new Date(),
      reviewNote: parsed.success ? parsed.data.reviewNote : undefined,
    },
  });
  return NextResponse.json(updated);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";
import { applyPendingChange } from "@/lib/pending-changes";

type Params = { params: Promise<{ id: string }> };

async function requireSuperAdmin() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return { admin: null, error: error! };
  if (admin.role !== "SUPER_ADMIN") {
    return { admin: null, error: NextResponse.json({ error: "Chỉ quản trị viên cấp cao mới có quyền này" }, { status: 403 }) };
  }
  return { admin, error: null };
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error;

  const { id } = await params;
  const change = await prisma.pendingChange.findUnique({ where: { id } });
  if (!change) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  if (change.status !== "PENDING") return NextResponse.json({ error: "Yêu cầu này đã được xử lý" }, { status: 400 });

  try {
    await applyPendingChange(change);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Không thể áp dụng thay đổi";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const updated = await prisma.pendingChange.update({
    where: { id },
    data: { status: "APPROVED", reviewedById: admin.id, reviewedAt: new Date() },
  });
  return NextResponse.json(updated);
}

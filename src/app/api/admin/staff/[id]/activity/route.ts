import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";

type Params = { params: Promise<{ id: string }> };

async function requireSuperAdmin() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return { admin: null, error: error! };
  if (admin.role !== "SUPER_ADMIN") {
    return { admin: null, error: NextResponse.json({ error: "Chỉ quản trị viên cấp cao mới có quyền này" }, { status: 403 }) };
  }
  return { admin, error: null };
}

// GET /api/admin/staff/[id]/activity - lay lich su hoat dong tu RequestLog (da co san,
// dung cho canh bao bao mat) loc theo email cua nhan vien nay - tai su dung ha tang co
// san thay vi xay 1 he thong log rieng. Tra ve: 14 ngay gan nhat (so luot thao tac/ngay,
// de ve bieu do so sanh hom nay/hom qua), + 30 hanh dong gan nhat (danh sach chi tiet).
export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  const target = await prisma.admin.findUnique({ where: { id }, select: { email: true } });
  if (!target) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const logs = await prisma.requestLog.findMany({
    where: { adminEmail: target.email, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    select: { id: true, path: true, method: true, statusCode: true, durationMs: true, createdAt: true },
  });

  const byDay = new Map<string, number>();
  for (const log of logs) {
    const day = log.createdAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  const dailyCounts = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: byDay.get(key) ?? 0 };
  });

  const mutationCount = logs.filter((l) => l.method !== "GET" && l.method !== "HEAD").length;
  const firstToday = logs.find((l) => l.createdAt.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10));

  return NextResponse.json({
    dailyCounts,
    mutationCount,
    totalRequests: logs.length,
    lastActiveAt: logs[0]?.createdAt ?? null,
    recentActions: logs.slice(0, 30),
    firstSeenToday: firstToday?.createdAt ?? null,
  });
}

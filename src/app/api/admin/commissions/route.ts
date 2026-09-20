import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";

const schema = z.object({ percent: z.number().int().min(0).max(50) });

// PATCH /api/admin/commissions { percent } - đổi % hoa hồng (áp dụng cho các đơn được xác nhận cọc SAU thời điểm đổi;
// hoa hồng đã ghi giữ nguyên tỉ lệ lúc ghi).
export async function PATCH(req: NextRequest) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tỉ lệ phải là số nguyên từ 0 đến 50" }, { status: 400 });

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", saleCommissionPercent: parsed.data.percent },
    update: { saleCommissionPercent: parsed.data.percent },
  });
  void logAdminAction(admin, "update-commission-rate", "SiteSettings", "singleton", `Hoa hồng Sale = ${parsed.data.percent}% tiền cọc`);
  return NextResponse.json({ ok: true, percent: parsed.data.percent });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";

const schema = z.object({ percent: z.number().int().min(0).max(50).nullable() });

// PATCH /api/admin/commissions/sale/:id { percent | null } - đặt tỉ lệ hoa hồng RIÊNG cho 1 Sale (null = dùng mức chung).
// Chỉ áp dụng cho các đơn được xác nhận cọc SAU thời điểm đổi; hoa hồng đã ghi giữ nguyên tỉ lệ lúc ghi.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tỉ lệ phải là số nguyên từ 0 đến 50 (hoặc để trống để dùng mức chung)" }, { status: 400 });

  const sale = await prisma.place.findUnique({ where: { id }, select: { id: true, name: true, category: true } });
  if (!sale || sale.category !== "SALE") return NextResponse.json({ error: "Không tìm thấy Sale" }, { status: 404 });

  await prisma.place.update({ where: { id }, data: { commissionPercent: parsed.data.percent } });
  void logAdminAction(admin, "update-sale-commission-rate", "Place", id, `${sale.name}: ${parsed.data.percent === null ? "dùng mức chung" : `${parsed.data.percent}%`}`);
  return NextResponse.json({ ok: true, percent: parsed.data.percent });
}

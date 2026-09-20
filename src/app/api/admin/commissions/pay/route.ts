import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";

const schema = z
  .object({
    ids: z.array(z.string().min(1)).max(200).optional(),
    salePlaceId: z.string().min(1).optional(),
    note: z.string().trim().max(200).optional(),
  })
  .refine((v) => (v.ids && v.ids.length > 0) || v.salePlaceId, "Chọn hoa hồng hoặc Sale cần đánh dấu đã trả");

// POST /api/admin/commissions/pay - đánh dấu ĐÃ TRẢ (bạn chuyển khoản cho Sale ngoài hệ thống, rồi bấm ở đây để ghi sổ).
// Chỉ đổi các hoa hồng đang "chờ trả"; đơn đã hủy/đã trả rồi thì bỏ qua.
export async function POST(req: NextRequest) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });

  const { ids, salePlaceId, note } = parsed.data;
  const where = { status: "PENDING" as const, ...(ids && ids.length > 0 ? { id: { in: ids } } : { salePlaceId }) };
  const pending = await prisma.saleCommission.aggregate({ where, _sum: { amount: true }, _count: true });
  if (pending._count === 0) return NextResponse.json({ error: "Không có hoa hồng nào đang chờ trả" }, { status: 400 });

  await prisma.saleCommission.updateMany({ where, data: { status: "PAID", paidAt: new Date(), paidNote: note || null } });
  void logAdminAction(admin, "pay-commission", "SaleCommission", salePlaceId ?? (ids ?? []).join(",").slice(0, 60), `Đã trả ${pending._count} hoa hồng, tổng ${(pending._sum.amount ?? 0).toLocaleString("vi-VN")}đ${note ? ` (${note})` : ""}`);
  return NextResponse.json({ ok: true, count: pending._count, total: pending._sum.amount ?? 0 });
}

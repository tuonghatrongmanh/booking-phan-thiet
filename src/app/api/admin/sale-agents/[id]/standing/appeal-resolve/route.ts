import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";
import { z } from "zod";
import { recalcSalePoints } from "@/lib/sale-points-server";
import { logAdminAction } from "@/lib/audit-log";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  approve: z.boolean(),
  note: z.string().trim().optional(),
});

// POST /api/admin/sale-agents/[id]/standing/appeal-resolve - xu ly khieu nai cua
// Sale. approve=true -> go luon dinh chi/cam (xoa SaleStanding). approve=false ->
// chi danh dau da xu ly, van giu dinh chi/cam, kem ghi chu tra loi.
export async function POST(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Chỉ SuperAdmin mới có quyền này" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const standing = await prisma.saleStanding.findUnique({ where: { placeId: id } });
  if (!standing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  if (parsed.data.approve) {
    await prisma.saleStanding.delete({ where: { placeId: id } });
    void recalcSalePoints(id).catch(() => {});
    void logAdminAction(admin, "approve-sale-appeal", "Place", id, parsed.data.note);
    return NextResponse.json({ ok: true, lifted: true });
  }

  const updated = await prisma.saleStanding.update({
    where: { placeId: id },
    data: { appealStatus: "RESOLVED", appealNote: parsed.data.note, appealResolvedAt: new Date() },
  });
  void logAdminAction(admin, "reject-sale-appeal", "Place", id, parsed.data.note);
  return NextResponse.json(updated);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "FULFILLED", "CANCELLED"]),
  note: z.string().trim().max(500).optional(),
});

type Params = { params: Promise<{ id: string }> };

// PATCH - admin cap nhat trang thai xu ly (VD: da goi xac nhan, da gui voucher qua
// email...). Neu huy (CANCELLED) thi HOAN LAI xu da tru cho nguoi dung - cong bang,
// vi ho khong nhan duoc gi ca.
export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "redemptions", "edit");
  if (permError) return permError;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const current = await prisma.redemption.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const becomingCancelled = parsed.data.status === "CANCELLED" && current.status !== "CANCELLED";

  const redemption = await prisma.$transaction(async (tx) => {
    if (becomingCancelled) {
      await tx.user.update({ where: { id: current.userId }, data: { coins: { increment: current.coinsSpent } } });
    }
    return tx.redemption.update({ where: { id }, data: parsed.data });
  });

  return NextResponse.json(redemption);
}

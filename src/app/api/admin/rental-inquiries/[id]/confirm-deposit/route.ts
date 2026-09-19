import { NextResponse } from "next/server";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { confirmDeposit } from "@/lib/booking-actions";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/rental-inquiries/:id/confirm-deposit - admin đã thấy tiền cọc vào ngân hàng và chốt đơn (chiếm xe).
// Logic nằm ở src/lib/booking-actions.ts (dùng chung với nút bấm trong Telegram).
export async function POST(_req: Request, { params }: Params) {
  const { admin, error } = await requireSectionAccess("car-rentals");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "car-rentals", "edit");
  if (permError) return permError;

  const { id } = await params;
  const result = await confirmDeposit("rental", id, { admin });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ item: result.item });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requirePlaceEdit } from "@/lib/admin-action";

type Params = { params: Promise<{ id: string; reviewId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { reviewId } = await params;
  const review = await prisma.review.findUnique({ where: { id: reviewId }, select: { place: { select: { category: true } } } });
  if (!review) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  const permError = requirePlaceEdit(admin, review.place.category);
  if (permError) return permError;
  try {
    await prisma.review.delete({ where: { id: reviewId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

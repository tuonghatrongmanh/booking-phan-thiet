import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import type { SectionKey } from "@/lib/admin-permissions";
import { PlaceCategory } from "@prisma/client";

type Params = { params: Promise<{ id: string; commentId: string }> };

const CATEGORY_SECTION: Partial<Record<PlaceCategory, SectionKey>> = {
  HOMESTAY: "homestay",
  ATTRACTION: "attractions",
  CAR_RENTAL: "car-rentals",
  SALE: "sale-agents",
};

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { commentId } = await params;
  const comment = await prisma.socialComment.findUnique({ where: { id: commentId }, include: { place: true } });
  if (!comment) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const section = CATEGORY_SECTION[comment.place.category];
  if (section) {
    const permError = requireCreateOrEdit(admin, section, "edit");
    if (permError) return permError;
  } else if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện hành động này" }, { status: 403 });
  }

  try {
    await prisma.socialComment.delete({ where: { id: commentId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

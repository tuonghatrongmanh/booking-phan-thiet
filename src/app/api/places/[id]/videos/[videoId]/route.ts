import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import type { SectionKey } from "@/lib/admin-permissions";
import { PlaceCategory } from "@prisma/client";

const CATEGORY_SECTION: Partial<Record<PlaceCategory, SectionKey>> = {
  HOMESTAY: "homestay",
  ATTRACTION: "attractions",
  CAR_RENTAL: "car-rentals",
  SALE: "sale-agents",
};

type Params = { params: Promise<{ id: string; videoId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { videoId } = await params;
  const video = await prisma.placeVideo.findUnique({ where: { id: videoId }, include: { place: true } });
  if (!video) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const section = CATEGORY_SECTION[video.place.category];
  if (section) {
    const permError = requireCreateOrEdit(admin, section, "edit");
    if (permError) return permError;
  } else if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện hành động này" }, { status: 403 });
  }

  await prisma.placeVideo.delete({ where: { id: videoId } });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import type { SectionKey } from "@/lib/admin-permissions";
import { PlaceCategory } from "@prisma/client";
import { fetchTiktokOembed } from "@/lib/tiktok-oembed";
import { z } from "zod";
import { recalcSalePoints } from "@/lib/sale-points-server";

const MAX_VIDEOS = 6;

const CATEGORY_SECTION: Partial<Record<PlaceCategory, SectionKey>> = {
  HOMESTAY: "homestay",
  ATTRACTION: "attractions",
  CAR_RENTAL: "car-rentals",
  SALE: "sale-agents",
};

const createSchema = z.object({
  sourceUrl: z.string().trim().url(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const place = await prisma.place.findUnique({ where: { id } });
  if (!place) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const section = CATEGORY_SECTION[place.category];
  if (section) {
    const permError = requireCreateOrEdit(admin, section, "edit");
    if (permError) return permError;
  } else if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện hành động này" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const count = await prisma.placeVideo.count({ where: { placeId: id } });
  if (count >= MAX_VIDEOS) {
    return NextResponse.json(
      { error: `Đã đủ ${MAX_VIDEOS} video, hãy xoá 1 video trước khi thêm mới` },
      { status: 400 }
    );
  }

  const { title, thumbnailUrl } = await fetchTiktokOembed(parsed.data.sourceUrl);

  const video = await prisma.placeVideo.create({
    data: { placeId: id, sourceUrl: parsed.data.sourceUrl, title, thumbnailUrl, sortOrder: count },
  });
  void recalcSalePoints(id).catch(() => {});
  return NextResponse.json(video, { status: 201 });
}

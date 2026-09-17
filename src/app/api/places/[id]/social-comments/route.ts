import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import type { SectionKey } from "@/lib/admin-permissions";
import { z } from "zod";
import { PlaceCategory, SocialPlatform } from "@prisma/client";
import { imagePathSchema } from "@/lib/validation";
import { recalcSalePoints } from "@/lib/sale-points-server";

const schema = z.object({
  imageUrl: imagePathSchema,
  platform: z.nativeEnum(SocialPlatform).optional().default("FACEBOOK"),
  authorName: z.string().optional(),
  note: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

// POST /api/places/:id/social-comments - đính kèm ảnh chụp màn hình bình luận thật
// từ Facebook/Zalo/TikTok làm bằng chứng uy tín cho địa điểm
const CATEGORY_SECTION: Partial<Record<PlaceCategory, SectionKey>> = {
  HOMESTAY: "homestay",
  ATTRACTION: "attractions",
  CAR_RENTAL: "car-rentals",
  SALE: "sale-agents",
};

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

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const comment = await prisma.socialComment.create({
    data: { ...parsed.data, placeId: id },
  });
  void recalcSalePoints(id).catch(() => {});
  return NextResponse.json(comment, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { imagePathSchema } from "@/lib/validation";
import { z } from "zod";
import { recalcSalePoints } from "@/lib/sale-points-server";

const MAX_TESTIMONIALS = 6;

const createSchema = z.object({
  imageUrl: imagePathSchema,
  authorName: z.string().trim().max(100).optional(),
  platform: z.enum(["FACEBOOK", "ZALO", "TIKTOK", "INSTAGRAM", "OTHER"]).optional().default("ZALO"),
  note: z.string().trim().max(300).optional(),
});

export async function POST(req: NextRequest) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const place = await prisma.place.findUnique({ where: { userId: actor.id } });
  if (!place) return NextResponse.json({ error: "Bạn chưa có hồ sơ Sale uy tín" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const count = await prisma.socialComment.count({ where: { placeId: place.id } });
  if (count >= MAX_TESTIMONIALS) {
    return NextResponse.json(
      { error: `Đã đủ ${MAX_TESTIMONIALS} ảnh, hãy xoá 1 ảnh trước khi thêm mới` },
      { status: 400 }
    );
  }

  const comment = await prisma.socialComment.create({
    data: {
      placeId: place.id,
      imageUrl: parsed.data.imageUrl,
      authorName: parsed.data.authorName || "Khách hàng",
      platform: parsed.data.platform,
      note: parsed.data.note,
    },
  });
  void recalcSalePoints(place.id).catch(() => {});
  return NextResponse.json(comment, { status: 201 });
}

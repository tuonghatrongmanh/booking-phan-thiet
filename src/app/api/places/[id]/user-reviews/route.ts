import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-log";
import { checkReviewAllowed, alertIfReviewBurst } from "@/lib/review-guard";
import { z } from "zod";
import { recalcSalePoints } from "@/lib/sale-points-server";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().trim().min(10, "Vui lòng viết cảm nghĩ chi tiết hơn (ít nhất 10 ký tự)").max(500),
  images: z.array(z.string().trim().min(1)).max(5).optional().default([]),
});

type Params = { params: Promise<{ id: string }> };

// POST /api/places/:id/user-reviews - nguoi dung THAT da dang nhap gui danh gia
// (khac voi /api/places/[id]/reviews la admin nhap ho), hien cong khai NGAY, khong co
// hang doi duyet rieng - mirror dung /api/foods/[id]/reviews.
export async function POST(req: NextRequest, { params }: Params) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập để đánh giá" }, { status: 401 });
  }

  if (!rateLimit(`place-review:${actor.id}`, 5, 60_000)) {
    return NextResponse.json({ error: "Bạn gửi đánh giá quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const place = await prisma.place.findUnique({ where: { id }, select: { id: true } });
  if (!place) return NextResponse.json({ error: "Không tìm thấy địa điểm" }, { status: 404 });

  const guard = await checkReviewAllowed({
    kind: "place",
    targetId: id,
    userId: actor.id,
    ip: getClientIp(Object.fromEntries(req.headers.entries())),
  });
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const review = await prisma.placeReview.create({
    data: {
      placeId: id,
      userId: actor.id,
      rating: parsed.data.rating,
      content: parsed.data.content,
      images: { create: parsed.data.images.map((url) => ({ url })) },
    },
    include: { user: { select: { name: true, avatar: true } }, images: true },
  });

  void recalcSalePoints(id).catch(() => {});
  void alertIfReviewBurst("place", id, review.rating);
  return NextResponse.json(review, { status: 201 });
}

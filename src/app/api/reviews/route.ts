import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";

// GET /api/reviews?limit=4 - danh sách đánh giá mới nhất (mọi địa điểm), dùng cho trang chủ
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? "8");

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { place: { select: { name: true } }, images: true },
  });

  return NextResponse.json(reviews);
}

const createSchema = z.object({
  placeId: z.string().min(1),
  reviewerName: z.string().min(1),
  reviewerAvatar: imagePathSchema.optional(),
  rating: z.number().int().min(1).max(5).optional().default(5),
  content: z.string().min(1).max(500),
  trustLabel: z.string().optional().default("Uy tín"),
  likes: z.number().int().min(0).optional().default(0),
  images: z.array(imagePathSchema).max(8).optional().default([]),
});

// POST /api/reviews - tao danh gia moi tu trang quan ly danh gia cong dong (chon truoc dia diem)
export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "reviews", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { images, placeId, ...data } = parsed.data;
  const review = await prisma.review.create({
    data: {
      ...data,
      placeId,
      images: { create: images.map((url) => ({ url })) },
    },
  });


  return NextResponse.json(review, { status: 201 });
}

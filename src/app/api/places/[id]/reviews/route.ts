import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const reviewSchema = z.object({
  reviewerName: z.string().trim().min(1),
  rating: z.number().int().min(1).max(5).optional().default(5),
  content: z.string().trim().min(1).max(500),
  trustLabel: z.string().trim().optional().default("Uy tín"),
  images: z.array(z.string().trim().min(1)).max(8).optional().default([]),
});

type Params = { params: Promise<{ id: string }> };

// POST /api/places/:id/reviews - admin nhap danh gia HO cho doanh nghiep (reviewerName
// la text tu do, khong gan userId that) - dung de hien thi o trang chu/chi tiet dia
// diem. Khac voi /api/places/[id]/user-reviews (danh gia THAT tu nguoi dung dang nhap).
export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      placeId: id,
      reviewerName: parsed.data.reviewerName,
      rating: parsed.data.rating,
      content: parsed.data.content,
      trustLabel: parsed.data.trustLabel,
      images: { create: parsed.data.images.map((url) => ({ url })) },
    },
    include: { images: true },
  });

  return NextResponse.json(review, { status: 201 });
}

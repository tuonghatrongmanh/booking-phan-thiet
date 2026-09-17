import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit, requestDeleteOrHide } from "@/lib/admin-action";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";

const updateSchema = z.object({
  reviewerName: z.string().min(1).optional(),
  reviewerAvatar: imagePathSchema.optional().nullable(),
  rating: z.number().int().min(1).max(5).optional(),
  content: z.string().min(1).max(500).optional(),
  trustLabel: z.string().min(1).optional(),
  likes: z.number().int().min(0).optional(),
  images: z.array(imagePathSchema).max(8).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id }, include: { images: true, place: { select: { name: true } } } });
  if (!review) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(review);
}

// PATCH - sua toan bo thong tin danh gia, bao gom thay anh (xoa het anh cu, tao lai
// tu mang moi neu client co gui truong `images` - don gian, khop voi cach form gui
// trang thai cuoi cung thay vi tinh diff).
export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "reviews", "edit");
  if (permError) return permError;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { images, ...data } = parsed.data;

  try {
    const review = await prisma.$transaction(async (tx) => {
      if (images) {
        await tx.reviewImage.deleteMany({ where: { reviewId: id } });
      }
      return tx.review.update({
        where: { id },
        data: {
          ...data,
          ...(images ? { images: { create: images.map((url) => ({ url })) } } : {}),
        },
        include: { images: true },
      });
    });

    if (data.content) {
    }

    return NextResponse.json(review);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const result = await requestDeleteOrHide({
    admin,
    section: "reviews",
    action: "delete",
    targetType: "Review",
    targetId: id,
    targetLabel: existing.reviewerName,
  });
  if (result.outcome !== "direct") return result.response;

  try {
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

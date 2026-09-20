import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requirePlaceEdit } from "@/lib/admin-action";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";

const schema = z.object({
  url: imagePathSchema,
  caption: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

// POST /api/places/:id/images - thêm 1 ảnh liên quan (avatar phụ, ảnh phòng, ảnh xe...)
export async function POST(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const place = await prisma.place.findUnique({ where: { id }, select: { category: true } });
  if (!place) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  const permError = requirePlaceEdit(admin, place.category);
  if (permError) return permError;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const image = await prisma.placeImage.create({
    data: { ...parsed.data, placeId: id },
  });
  return NextResponse.json(image, { status: 201 });
}

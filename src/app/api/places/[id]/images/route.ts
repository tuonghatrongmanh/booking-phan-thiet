import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";

const schema = z.object({
  url: imagePathSchema,
  caption: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

// POST /api/places/:id/images - thêm 1 ảnh liên quan (avatar phụ, ảnh phòng, ảnh xe...)
export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
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

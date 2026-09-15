import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";

const schema = z.object({
  url: imagePathSchema,
  sortOrder: z.number().int().optional().default(0),
});

type Params = { params: Promise<{ id: string }> };

// POST /api/foods/:id/images - them 1 anh vao gallery "Anh thuc te" cua mon an
export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const image = await prisma.foodImage.create({
    data: { ...parsed.data, foodId: id },
  });
  return NextResponse.json(image, { status: 201 });
}

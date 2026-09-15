import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit, requestDeleteOrHide } from "@/lib/admin-action";
import { z } from "zod";
import { PlaceCategory } from "@prisma/client";
import { imagePathSchema } from "@/lib/validation";
import { saveTranslations } from "@/lib/content-translation";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(3).optional(),
  image: imagePathSchema.optional(),
  discountPercent: z.number().int().min(0).max(100).optional(),
  placeName: z.string().min(1).optional(),
  phone: z.string().optional(),
  category: z.nativeEnum(PlaceCategory).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  active: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const sale = await prisma.sale.findUnique({ where: { id } });
  if (!sale) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(sale);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const permError = requireCreateOrEdit(admin, "sales", "edit");
  if (permError) return permError;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { startDate, endDate, ...rest } = parsed.data;
  try {
    const sale = await prisma.sale.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
      },
    });
    if (parsed.data.title) {
      void saveTranslations("Sale", sale.id, { title: sale.title });
    }
    return NextResponse.json(sale);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const existing = await prisma.sale.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const result = await requestDeleteOrHide({
    admin,
    section: "sales",
    action: "delete",
    targetType: "Sale",
    targetId: id,
    targetLabel: existing.title,
  });
  if (result.outcome !== "direct") return result.response;

  try {
    await prisma.sale.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

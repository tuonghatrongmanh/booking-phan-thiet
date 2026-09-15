import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit, requestDeleteOrHide } from "@/lib/admin-action";
import { z } from "zod";

const updateSchema = z.object({
  label: z.string().trim().min(2).optional(),
  icon: z.string().trim().min(2).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const item = await prisma.foodCategory.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const permError = requireCreateOrEdit(admin, "food-categories", "edit");
  if (permError) return permError;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const item = await prisma.foodCategory.update({ where: { id }, data: parsed.data });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const existing = await prisma.foodCategory.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const inUse = await prisma.food.count({ where: { categoryId: id } });
  if (inUse > 0) {
    return NextResponse.json({ error: `Không thể xóa: còn ${inUse} món ăn đang dùng danh mục này` }, { status: 400 });
  }

  const result = await requestDeleteOrHide({
    admin,
    section: "food-categories",
    action: "delete",
    targetType: "FoodCategory",
    targetId: id,
    targetLabel: existing.label,
  });
  if (result.outcome !== "direct") return result.response;

  await prisma.foodCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

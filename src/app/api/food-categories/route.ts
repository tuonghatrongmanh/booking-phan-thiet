import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";
import { slugifyBase } from "@/lib/slug";

const schema = z.object({
  id: z.string().trim().min(1).optional().or(z.literal("")),
  label: z.string().trim().min(2),
  icon: z.string().trim().min(2),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

// GET /api/food-categories - danh sach danh muc mon an (public, dung cho bo loc /am-thuc)
export async function GET() {
  const items = await prisma.foodCategory.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const permError = requireCreateOrEdit(admin, "food-categories", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const id = slugifyBase(parsed.data.id || parsed.data.label);
  const exists = await prisma.foodCategory.findUnique({ where: { id } });
  if (exists) return NextResponse.json({ error: "Danh mục này đã tồn tại" }, { status: 400 });

  const item = await prisma.foodCategory.create({
    data: { id, label: parsed.data.label, icon: parsed.data.icon, active: parsed.data.active, sortOrder: parsed.data.sortOrder },
  });
  return NextResponse.json(item, { status: 201 });
}

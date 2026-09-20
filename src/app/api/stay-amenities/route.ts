import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";

const schema = z.object({
  label: z.string().trim().min(1),
  icon: z.string().trim().min(1),
  subtitle: z.string().trim().nullable().optional(),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export async function GET() {
  const items = await prisma.stayAmenity.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "stay-amenities", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const exists = await prisma.stayAmenity.findUnique({ where: { label: parsed.data.label } });
  if (exists) return NextResponse.json({ error: "Tiện ích này đã tồn tại" }, { status: 400 });

  const item = await prisma.stayAmenity.create({ data: parsed.data });
  return NextResponse.json(item, { status: 201 });
}

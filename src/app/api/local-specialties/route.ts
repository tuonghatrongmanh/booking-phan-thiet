import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2),
  image: z.string().trim().nullable().optional(),
  price: z.number().int().min(0),
  unit: z.string().trim().min(1).optional().default("kg"),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

// GET /api/local-specialties - danh sach dac san (public, dung cho trang /am-thuc)
export async function GET() {
  const items = await prisma.localSpecialty.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const permError = requireCreateOrEdit(admin, "local-specialties", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const item = await prisma.localSpecialty.create({ data: parsed.data });
  return NextResponse.json(item, { status: 201 });
}

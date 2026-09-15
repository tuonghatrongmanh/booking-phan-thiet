import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit, requestDeleteOrHide } from "@/lib/admin-action";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  image: imagePathSchema.optional(),
  href: z.string().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const logo = await prisma.brandLogo.findUnique({ where: { id } });
  if (!logo) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(logo);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "brand-logos", "edit");
  if (permError) return permError;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const logo = await prisma.brandLogo.update({ where: { id }, data: parsed.data });
    return NextResponse.json(logo);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const existing = await prisma.brandLogo.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const result = await requestDeleteOrHide({
    admin,
    section: "brand-logos",
    action: "delete",
    targetType: "BrandLogo",
    targetId: id,
    targetLabel: existing.name,
  });
  if (result.outcome !== "direct") return result.response;

  try {
    await prisma.brandLogo.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

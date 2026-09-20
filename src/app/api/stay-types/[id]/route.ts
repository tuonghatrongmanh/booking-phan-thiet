import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gateActiveEdit, requireAdminSession } from "@/lib/admin-action";
import { z } from "zod";

const updateSchema = z.object({
  label: z.string().trim().min(1).optional(),
  icon: z.string().trim().min(1).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.stayTypeSetting.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  const gate = await gateActiveEdit({
    admin,
    section: "stay-types",
    wasActive: existing.active,
    nextActive: parsed.data.active,
    targetType: "StayTypeSetting",
    targetId: id,
    targetLabel: existing.label,
  });
  if (gate) return gate;

  try {
    const item = await prisma.stayTypeSetting.update({ where: { id }, data: parsed.data });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

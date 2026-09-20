import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gateActiveEdit, requestDeleteOrHide, requireAdminSession } from "@/lib/admin-action";
import { z } from "zod";

const updateSchema = z.object({
  icon: z.string().trim().min(1).optional(),
  subtitle: z.string().trim().nullable().optional(),
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

  const existing = await prisma.stayAmenity.findUnique({ where: { label: id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  const gate = await gateActiveEdit({
    admin,
    section: "stay-amenities",
    wasActive: existing.active,
    nextActive: parsed.data.active,
    targetType: "StayAmenity",
    targetId: id,
    targetLabel: id,
  });
  if (gate) return gate;

  try {
    const item = await prisma.stayAmenity.update({ where: { label: id }, data: parsed.data });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const result = await requestDeleteOrHide({ admin, section: "stay-amenities", action: "delete", targetType: "StayAmenity", targetId: id, targetLabel: id });
  if (result.outcome !== "direct") return result.response;
  try {
    await prisma.stayAmenity.delete({ where: { label: id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

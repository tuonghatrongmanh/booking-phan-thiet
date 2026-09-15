import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit, requestDeleteOrHide } from "@/lib/admin-action";
import { z } from "zod";

const updateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  name: z.string().trim().min(2).optional(),
  description: z.string().trim().min(3).optional(),
  icon: z.string().trim().min(2).optional(),
  image: z.string().trim().nullable().optional(),
  coinMin: z.number().int().min(0).optional(),
  coinMax: z.number().int().min(0).optional(),
  dailyLimit: z.number().int().min(1).max(20).optional(),
  comingSoon: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  featuredImage: z.string().trim().nullable().optional(),
  featuredOrder: z.number().int().min(1).max(4).nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const game = await prisma.game.findUnique({ where: { id } });
  if (!game) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(game);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "games", "edit");
  if (permError) return permError;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const current = await prisma.game.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const coinMin = parsed.data.coinMin ?? current.coinMin;
  const coinMax = parsed.data.coinMax ?? current.coinMax;
  if (coinMax < coinMin) return NextResponse.json({ error: "Xu tối đa phải >= xu tối thiểu" }, { status: 400 });

  try {
    const game = await prisma.game.update({ where: { id }, data: parsed.data });
    return NextResponse.json(game);
  } catch {
    return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 409 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const existing = await prisma.game.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const result = await requestDeleteOrHide({
    admin,
    section: "games",
    action: "delete",
    targetType: "Game",
    targetId: id,
    targetLabel: existing.name,
  });
  if (result.outcome !== "direct") return result.response;

  try {
    await prisma.game.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

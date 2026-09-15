import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";

const heroTileSchema = z.object({
  label: z.string().min(1),
  tagText: z.string().min(1),
  href: z.string().min(1),
  image: imagePathSchema,
  icon: z.string().min(1).optional(),
  badgeColor: z.string().min(1).optional(),
  special: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional().default(true),
});

// GET /api/hero-tiles?active=true
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeParam = searchParams.get("active");

  const tiles = await prisma.heroTile.findMany({
    where: activeParam !== null ? { active: activeParam === "true" } : {},
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(tiles);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "hero-tiles", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = heroTileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const tile = await prisma.heroTile.create({ data: parsed.data });
  return NextResponse.json(tile, { status: 201 });
}

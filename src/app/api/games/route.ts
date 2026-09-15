import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";

const gameSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và gạch ngang"),
  name: z.string().trim().min(2),
  description: z.string().trim().min(3),
  icon: z.string().trim().min(2),
  image: z.string().trim().nullable().optional(),
  coinMin: z.number().int().min(0),
  coinMax: z.number().int().min(0),
  dailyLimit: z.number().int().min(1).max(20).optional().default(1),
  comingSoon: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
  featuredImage: z.string().trim().nullable().optional(),
  featuredOrder: z.number().int().min(1).max(4).nullable().optional(),
});

// GET /api/games - danh sach game (public, dung cho trang hub /game-trung-thuong)
export async function GET() {
  const games = await prisma.game.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json(games);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "games", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = gameSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.coinMax < parsed.data.coinMin) {
    return NextResponse.json({ error: "Xu tối đa phải >= xu tối thiểu" }, { status: 400 });
  }

  try {
    const game = await prisma.game.create({ data: parsed.data });
    return NextResponse.json(game, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 409 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";

const rewardSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(3),
  image: z.string().trim().optional(),
  category: z.string().trim().min(2),
  coinCost: z.number().int().min(1),
  stock: z.number().int().min(0).nullable().optional(),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

// GET /api/rewards - danh sach doi thuong (public, dung cho trang hub)
export async function GET() {
  const rewards = await prisma.rewardItem.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json(rewards);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "rewards", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = rewardSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const reward = await prisma.rewardItem.create({ data: parsed.data });
  return NextResponse.json(reward, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";

const schema = z.object({
  name: z.string().trim().min(1),
  avatar: imagePathSchema.optional().or(z.literal("")),
  action: z.string().trim().min(1),
  icon: z.string().trim().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeParam = searchParams.get("active");

  const items = await prisma.activitySample.findMany({
    where: activeParam !== null ? { active: activeParam === "true" } : {},
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "activity-samples", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = { ...parsed.data, avatar: parsed.data.avatar || undefined };
  const item = await prisma.activitySample.create({ data });
  return NextResponse.json(item, { status: 201 });
}

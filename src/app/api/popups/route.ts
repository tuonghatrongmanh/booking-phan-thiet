import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";

const popupSchema = z.object({
  title: z.string().optional(),
  image: imagePathSchema,
  href: z.string().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeParam = searchParams.get("active");

  const popups = await prisma.popup.findMany({
    where: activeParam !== null ? { active: activeParam === "true" } : {},
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(popups);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "popups", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = popupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const popup = await prisma.popup.create({ data: parsed.data });
  return NextResponse.json(popup, { status: 201 });
}

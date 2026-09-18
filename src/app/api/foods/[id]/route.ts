import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit, requestDeleteOrHide } from "@/lib/admin-action";
import { z } from "zod";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import { pingIndexNow, foodPublicUrl } from "@/lib/indexnow";

const updateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  restaurant: z.string().trim().min(2).optional(),
  categoryId: z.string().trim().min(1).optional(),
  image: z.string().trim().nullable().optional(),
  description: z.string().trim().min(3).optional(),
  content: z.string().nullable().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  priceFrom: z.number().int().min(0).optional(),
  unit: z.string().trim().min(1).optional(),
  badge: z.string().trim().nullable().optional(),
  mealTime: z.string().trim().nullable().optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  phone: z.string().trim().nullable().optional(),
  googleMapsUrl: z.string().trim().nullable().optional(),
  videoUrl: z.string().trim().regex(/^[A-Za-z0-9_-]{6,20}$/, "Video ID không hợp lệ").nullable().optional().or(z.literal("")),
  videoCaption: z.string().trim().nullable().optional(),
  mapEmbedUrl: z.string().trim().nullable().optional(),
  openingHours: z.string().trim().nullable().optional(),
  is24h: z.boolean().optional(),
  fanpageUrl: z.string().trim().nullable().optional(),
  websiteUrl: z.string().trim().nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const food = await prisma.food.findUnique({ where: { id } });
  if (!food) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(food);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const permError = requireCreateOrEdit(admin, "foods", "edit");
  if (permError) return permError;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = { ...parsed.data };
  if (typeof data.content === "string") data.content = sanitizeArticleHtml(data.content);

  try {
    const food = await prisma.food.update({ where: { id }, data });
    if (food.active || data.active === false) pingIndexNow([foodPublicUrl(food.slug)]);
    return NextResponse.json(food);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const existing = await prisma.food.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const result = await requestDeleteOrHide({
    admin,
    section: "foods",
    action: "delete",
    targetType: "Food",
    targetId: id,
    targetLabel: existing.name,
  });
  if (result.outcome !== "direct") return result.response;

  await prisma.food.delete({ where: { id } });
  if (existing.active) pingIndexNow([foodPublicUrl(existing.slug)]);
  return NextResponse.json({ ok: true });
}

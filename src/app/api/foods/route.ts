import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import { slugifyBase, ensureUniqueSlug } from "@/lib/slug";

const foodSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().max(120).optional().or(z.literal("")),
  restaurant: z.string().trim().min(2),
  categoryId: z.string().trim().min(1),
  image: z.string().trim().nullable().optional(),
  description: z.string().trim().min(3),
  content: z.string().optional().or(z.literal("")),
  rating: z.number().min(0).max(5).optional().default(4.8),
  reviewCount: z.number().int().min(0).optional().default(0),
  priceFrom: z.number().int().min(0),
  unit: z.string().trim().min(1).optional().default("phần"),
  badge: z.string().trim().nullable().optional(),
  mealTime: z.string().trim().nullable().optional(),
  featured: z.boolean().optional().default(false),
  verified: z.boolean().optional().default(false),
  phone: z.string().trim().nullable().optional(),
  googleMapsUrl: z.string().trim().nullable().optional(),
  videoUrl: z.string().trim().regex(/^[A-Za-z0-9_-]{6,20}$/, "Video ID không hợp lệ").nullable().optional().or(z.literal("")),
  videoCaption: z.string().trim().nullable().optional(),
  mapEmbedUrl: z.string().trim().nullable().optional(),
  openingHours: z.string().trim().nullable().optional(),
  is24h: z.boolean().optional().default(false),
  fanpageUrl: z.string().trim().nullable().optional(),
  websiteUrl: z.string().trim().nullable().optional(),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

// GET /api/foods - danh sach mon an (public, dung cho trang /am-thuc)
export async function GET() {
  const foods = await prisma.food.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json(foods);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const permError = requireCreateOrEdit(admin, "foods", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = foodSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const baseSlug = slugifyBase(parsed.data.slug || parsed.data.name);
  const slug = await ensureUniqueSlug(baseSlug, (candidate) =>
    prisma.food.findUnique({ where: { slug: candidate } }).then(Boolean)
  );

  const food = await prisma.food.create({
    data: {
      ...parsed.data,
      slug,
      content: parsed.data.content ? sanitizeArticleHtml(parsed.data.content) : null,
    },
  });

  return NextResponse.json(food, { status: 201 });
}

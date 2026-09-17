import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit, requestDeleteOrHide } from "@/lib/admin-action";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import { slugifyBase, ensureUniqueSlug } from "@/lib/slug";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().max(120).optional().or(z.literal("")),
  excerpt: z.string().min(3).max(500).optional(),
  content: z.string().min(3).optional(),
  coverImage: imagePathSchema.optional(),
  category: z.string().min(1).optional(),
  metaTitle: z.string().max(70).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
  focusKeyword: z.string().max(80).optional().or(z.literal("")),
  placeId: z.string().nullable().optional(),
  published: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const news = await prisma.news.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  });
  if (!news) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(news);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const permError = requireCreateOrEdit(admin, "tin-tuc", "edit");
  if (permError) return permError;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data: typeof parsed.data = { ...parsed.data };
  if (data.slug !== undefined) {
    data.slug = await ensureUniqueSlug(slugifyBase(data.slug), (candidate) =>
      prisma.news.findFirst({ where: { slug: candidate, id: { not: id } } }).then(Boolean)
    );
  }
  if (data.content !== undefined) {
    data.content = sanitizeArticleHtml(data.content);
  }

  try {
    const news = await prisma.news.update({ where: { id }, data });
    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const result = await requestDeleteOrHide({
    admin,
    section: "tin-tuc",
    action: "delete",
    targetType: "News",
    targetId: id,
    targetLabel: existing.title,
    ownerId: existing.authorId,
  });
  if (result.outcome !== "direct") return result.response;

  await prisma.news.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

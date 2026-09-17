import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import { slugifyBase, ensureUniqueSlug } from "@/lib/slug";

const newsSchema = z.object({
  title: z.string().min(3, "Tiêu đề quá ngắn"),
  slug: z.string().max(120).optional().or(z.literal("")),
  excerpt: z.string().min(3).max(500),
  content: z.string().min(3),
  coverImage: imagePathSchema,
  category: z.string().min(1).optional().default("Kinh nghiệm"),
  metaTitle: z.string().max(70).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
  focusKeyword: z.string().max(80).optional().or(z.literal("")),
  placeId: z.string().nullable().optional(),
  published: z.boolean().optional().default(true),
});

// GET /api/news?page=1&pageSize=10&published=true
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const publishedParam = searchParams.get("published");

  const where =
    publishedParam === null ? {} : { published: publishedParam === "true" };

  const [items, total] = await Promise.all([
    prisma.news.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { author: { select: { name: true } } },
    }),
    prisma.news.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

// POST /api/news - tao bai viet moi (yeu cau dang nhap admin)
export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const permError = requireCreateOrEdit(admin, "tin-tuc", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = newsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const baseSlug = slugifyBase(parsed.data.slug || parsed.data.title);
  const slug = await ensureUniqueSlug(baseSlug, (candidate) =>
    prisma.news.findFirst({ where: { slug: candidate } }).then(Boolean)
  );

  const news = await prisma.news.create({
    data: {
      ...parsed.data,
      slug,
      content: sanitizeArticleHtml(parsed.data.content),
      authorId: admin.id,
    },
  });


  return NextResponse.json(news, { status: 201 });
}

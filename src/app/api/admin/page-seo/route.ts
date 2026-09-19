import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { SEO_PAGES } from "@/lib/page-seo";

const schema = z.object({
  key: z.string().refine((k) => SEO_PAGES.some((p) => p.key === k), "Trang không hợp lệ"),
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
  focusKeyword: z.string().trim().max(80).optional().or(z.literal("")),
});

// PUT /api/admin/page-seo - lưu SEO cho 1 trang danh sách (/thue-xe, /luu-tru, /am-thuc...).
// Để trống = quay về tiêu đề/mô tả mặc định trong src/lib/page-seo.ts.
export async function PUT(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "settings", "edit");
  if (permError) return permError;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { key, metaTitle, metaDescription, focusKeyword } = parsed.data;
  const data = { metaTitle: metaTitle || null, metaDescription: metaDescription || null, focusKeyword: focusKeyword || null };
  const row = await prisma.pageSeoSetting.upsert({ where: { key }, create: { key, ...data }, update: data });
  return NextResponse.json(row);
}

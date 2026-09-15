import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { suggestKeywords } from "@/lib/seo-keyword-suggest";

const bodySchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().optional().default(""),
  category: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Thiếu tiêu đề bài viết" }, { status: 400 });
  }

  const result = await suggestKeywords(parsed.data.title, parsed.data.excerpt, parsed.data.category);
  if (!result) {
    return NextResponse.json(
      { error: "Chưa cấu hình GEMINI_API_KEY hoặc không lấy được gợi ý, vui lòng thử lại sau." },
      { status: 503 }
    );
  }

  return NextResponse.json(result);
}

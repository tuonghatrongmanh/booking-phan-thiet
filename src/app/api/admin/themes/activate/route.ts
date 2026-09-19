import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { DEFAULT_THEME_KEY, ensureBuiltinThemes, invalidateThemeCache } from "@/lib/site-theme";
import { activateSchema } from "@/lib/theme-schema";

// POST /api/admin/themes/activate { key } - ap dung giao dien cho toan site (khach thay ngay
// o lan tai trang ke tiep). key = "default" de quay ve giao dien goc.
export async function POST(req: NextRequest) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;

  const parsed = activateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Thiếu giao diện cần áp dụng" }, { status: 400 });
  const { key } = parsed.data;

  await ensureBuiltinThemes();
  const theme = await prisma.siteTheme.findUnique({ where: { key } });
  if (!theme) return NextResponse.json({ error: "Không tìm thấy giao diện" }, { status: 404 });

  const value = key === DEFAULT_THEME_KEY ? null : key;
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", activeThemeKey: value },
    update: { activeThemeKey: value },
  });
  await logAdminAction(admin, "activate", "site-theme", theme.id, `Áp dụng giao diện "${theme.name}" cho toàn site`);
  invalidateThemeCache();
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, activeKey: key });
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { DEFAULT_THEME_KEY, invalidateThemeCache } from "@/lib/site-theme";
import { emptyToNull, themeUpdateSchema } from "@/lib/theme-schema";

type Ctx = { params: Promise<{ id: string }> };

// PATCH - sua mau/anh 1 giao dien. Giao dien "default" chi doc (la bang mau goc trong globals.css).
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;
  const { id } = await params;

  const existing = await prisma.siteTheme.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy giao diện" }, { status: 404 });
  if (existing.key === DEFAULT_THEME_KEY) {
    return NextResponse.json({ error: "Giao diện mặc định không chỉnh sửa được - hãy tạo giao diện mới" }, { status: 400 });
  }

  const parsed = themeUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const theme = await prisma.siteTheme.update({ where: { id }, data: emptyToNull(parsed.data) });
  await logAdminAction(admin, "update", "site-theme", id, `Sửa giao diện "${theme.name}"`);
  invalidateThemeCache();
  revalidatePath("/", "layout");
  return NextResponse.json(theme);
}

// DELETE - chi xoa giao dien tu tao va khong dang ap dung
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;
  const { id } = await params;

  const existing = await prisma.siteTheme.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy giao diện" }, { status: 404 });
  if (existing.builtin) return NextResponse.json({ error: "Không xóa được giao diện có sẵn" }, { status: 400 });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { activeThemeKey: true } });
  if (settings?.activeThemeKey === existing.key) {
    return NextResponse.json({ error: "Giao diện đang được áp dụng - hãy chuyển sang giao diện khác trước khi xóa" }, { status: 400 });
  }

  await prisma.siteTheme.delete({ where: { id } });
  await logAdminAction(admin, "delete", "site-theme", id, `Xóa giao diện "${existing.name}"`);
  return NextResponse.json({ ok: true });
}

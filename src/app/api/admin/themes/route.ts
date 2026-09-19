import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { ensureBuiltinThemes } from "@/lib/site-theme";
import { emptyToNull, slugifyKey, themeFieldsSchema } from "@/lib/theme-schema";

// GET /api/admin/themes - danh sach giao dien (tu tao cac giao dien co san neu thieu)
export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  await ensureBuiltinThemes();
  const themes = await prisma.siteTheme.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json(themes);
}

// POST /api/admin/themes - tao giao dien tu dat (vd "Giang sinh", "Le 30/4")
export async function POST(req: NextRequest) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;

  const parsed = themeFieldsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  // key duy nhat: them hau to so neu trung
  const base = slugifyKey(parsed.data.name);
  let key = base;
  for (let i = 2; await prisma.siteTheme.findUnique({ where: { key } }); i++) key = `${base}-${i}`;

  const count = await prisma.siteTheme.count();
  const theme = await prisma.siteTheme.create({ data: { ...emptyToNull(parsed.data), key, builtin: false, sortOrder: count } });
  await logAdminAction(admin, "create", "site-theme", theme.id, `Tạo giao diện "${theme.name}"`);
  return NextResponse.json(theme, { status: 201 });
}

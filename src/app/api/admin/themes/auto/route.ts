import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { ensureBuiltinThemes, invalidateThemeCache } from "@/lib/site-theme";
import { autoSchema } from "@/lib/theme-schema";

// POST /api/admin/themes/auto { enabled } - bật/tắt chế độ TỰ ĐỘNG đổi giao diện theo lịch của từng giao diện.
export async function POST(req: NextRequest) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;

  const parsed = autoSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  await ensureBuiltinThemes();
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", autoThemeEnabled: parsed.data.enabled },
    update: { autoThemeEnabled: parsed.data.enabled },
  });
  await logAdminAction(admin, parsed.data.enabled ? "auto-theme-on" : "auto-theme-off", "site-theme", "singleton", parsed.data.enabled ? "Bật tự động đổi giao diện theo lịch" : "Tắt tự động đổi giao diện theo lịch");
  invalidateThemeCache();
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, enabled: parsed.data.enabled });
}

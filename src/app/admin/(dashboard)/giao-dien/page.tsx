import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/current-admin";
import { ensureBuiltinThemes } from "@/lib/site-theme";
import { getUiSlots } from "@/lib/ui-slots";
import ThemeManager, { type ThemeRow } from "@/components/admin/ThemeManager";
import UiSlotsManager from "@/components/admin/UiSlotsManager";

export const dynamic = "force-dynamic";

export default async function AdminThemesPage() {
  const admin = await getCurrentAdmin();
  if (admin?.role !== "SUPER_ADMIN") {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-slate-600">
        Chỉ SuperAdmin mới được đổi giao diện của toàn website.
      </div>
    );
  }

  await ensureBuiltinThemes();
  const [themes, settings, slots] = await Promise.all([
    prisma.siteTheme.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { activeThemeKey: true, autoThemeEnabled: true } }),
    getUiSlots(),
  ]);
  const rows: ThemeRow[] = themes.map((t) => ({
    id: t.id,
    key: t.key,
    name: t.name,
    description: t.description,
    builtin: t.builtin,
    primary: t.primary,
    secondary: t.secondary,
    footerColor: t.footerColor,
    heroOverlay: t.heroOverlay,
    heroOverlayOpacity: t.heroOverlayOpacity,
    previewImage: t.previewImage,
    heroImage: t.heroImage,
    headerImage: t.headerImage,
    footerImage: t.footerImage,
    startDate: t.startDate,
    endDate: t.endDate,
    repeatYearly: t.repeatYearly,
    effect: t.effect,
    effectImage: t.effectImage,
    effectDensity: t.effectDensity,
    bannerText: t.bannerText,
  }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Giao diện &amp; Lễ hội</h1>
        <p className="text-slate-400">Đổi màu sắc, ảnh hero/header/footer cho các dịp lễ lớn (Tết, Trung thu, Quốc khánh...) chỉ với vài cú bấm.</p>
      </div>

      <section>
        <h2 className="font-display font-bold text-lg text-slate-800 mb-3">Giao diện theo dịp lễ</h2>
        <ThemeManager initialThemes={rows} initialActiveKey={settings?.activeThemeKey ?? "default"} initialAuto={settings?.autoThemeEnabled ?? false} />
      </section>

      <section>
        <h2 className="font-display font-bold text-lg text-slate-800 mb-1">Icon &amp; nút bấm</h2>
        <p className="text-slate-400 mb-3">Thay các icon/nút chính bằng ảnh hoặc GIF của riêng bạn (ví dụ nút hình sóng biển, mòng biển).</p>
        <UiSlotsManager initial={slots} />
      </section>
    </div>
  );
}

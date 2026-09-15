import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export const DEFAULT_SITE_SETTINGS = {
  logoUrl: "/images/logo.png",
  faviconUrl: "/favicon.ico",
  footerDescription: "Hệ thống tra cứu và đánh giá uy tín hàng đầu tại Phan Thiết. Minh bạch – Cộng đồng vì cộng đồng.",
  homeSeoTitle: "Booking Phan Thiết - Tra cứu thông tin uy tín",
  homeSeoDescription:
    "Tra cứu, đánh giá homestay, quán ăn, dịch vụ thuê xe uy tín tại Phan Thiết. Cộng đồng chia sẻ minh bạch, cảnh báo lừa đảo, review thật.",
};

export type SiteSettingsData = typeof DEFAULT_SITE_SETTINGS;

// Doc cau hinh site - luon tra ve du 5 truong (fallback ve DEFAULT_SITE_SETTINGS cho
// tung truong rieng le neu admin chua dien / chua co dong nao trong DB), de moi noi
// goi ham nay khong bao gio phai tu xu ly null.
export async function getSiteSettings(): Promise<SiteSettingsData> {
  const row = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } }).catch(() => null);
  return {
    logoUrl: row?.logoUrl || DEFAULT_SITE_SETTINGS.logoUrl,
    faviconUrl: row?.faviconUrl || DEFAULT_SITE_SETTINGS.faviconUrl,
    footerDescription: row?.footerDescription || DEFAULT_SITE_SETTINGS.footerDescription,
    homeSeoTitle: row?.homeSeoTitle || DEFAULT_SITE_SETTINGS.homeSeoTitle,
    homeSeoDescription: row?.homeSeoDescription || DEFAULT_SITE_SETTINGS.homeSeoDescription,
  };
}

export async function updateSiteSettings(data: Partial<SiteSettingsData>) {
  return prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}

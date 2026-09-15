import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export const DEFAULT_LUU_TRU_PAGE_SETTINGS = {
  mapEmbedUrl: null as string | null,
  promoTitle: "Giảm đến 30%",
  promoSubtitle: "cho đặt phòng sớm",
  promoButtonText: "Xem ưu đãi ngay",
  verifiedStampImage: null as string | null,
  crossPromoImage: null as string | null,
  crossPromoTitle: "Khám phá thêm địa điểm tham quan tại Phan Thiết",
  crossPromoButtonText: "Xem thêm",
};

export type LuuTruPageSettingsData = typeof DEFAULT_LUU_TRU_PAGE_SETTINGS;

const FIELD_KEYS = Object.keys(DEFAULT_LUU_TRU_PAGE_SETTINGS) as (keyof LuuTruPageSettingsData)[];

// Doc cau hinh trang /luu-tru (link nhung Google Maps tong the TP Phan Thiet + banner
// khuyen mai cuoi sidebar) va khoi dung chung cho trang chi tiet Dia diem tham quan
// /diem-tham-quan/[id] (con dau kiem chung + banner cross-promo cuoi trang, giong het
// AmThucBannerSettings da lam cho Am thuc).
export async function getLuuTruPageSettings(): Promise<LuuTruPageSettingsData> {
  const row = await prisma.luuTruPageSettings.findUnique({ where: { id: SETTINGS_ID } }).catch(() => null);
  const result = {} as LuuTruPageSettingsData;
  for (const key of FIELD_KEYS) {
    (result[key] as string | null) = (row?.[key] as string | null | undefined) ?? DEFAULT_LUU_TRU_PAGE_SETTINGS[key] ?? null;
  }
  return result;
}

export async function updateLuuTruPageSettings(data: Partial<LuuTruPageSettingsData>) {
  return prisma.luuTruPageSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}

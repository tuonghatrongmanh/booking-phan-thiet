import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export const DEFAULT_AM_THUC_BANNER_SETTINGS = {
  heroBanner: "/images/banner.png",
  badgeIcon: "fa-solid fa-utensils",
  badgeText: "ẨM THỰC PHAN THIẾT",
  headingTop: "Hương vị biển cả,",
  headingBottom: "Đậm đà Phan Thiết",
  subheading: "Khám phá hải sản tươi sống, đặc sản địa phương và những quán ăn được du khách yêu thích nhất.",

  promoImage: "/images/banner.png",
  promoTitle: "Combo hải sản siêu hấp dẫn!",
  promoPrice: "Chỉ từ 299.000đ/người",
  promoFeature1: "Hải sản tươi sống",
  promoFeature2: "Chế biến theo yêu cầu",
  promoFeature3: "Phục vụ tận tình",
  promoButtonText: "Đặt bàn ngay",

  trustIcon1: "fa-solid fa-shield-heart",
  trustTitle1: "Nhà hàng uy tín",
  trustDesc1: "Đối tác địa phương",
  trustIcon2: "fa-solid fa-bowl-rice",
  trustTitle2: "Đa dạng món ăn",
  trustDesc2: "Từ hải sản đến đặc sản",
  trustIcon3: "fa-solid fa-calendar-check",
  trustTitle3: "Đặt bàn dễ dàng",
  trustDesc3: "Nhanh chóng tiện lợi",

  verifiedStampImage: null as string | null,
  crossPromoImage: null as string | null,
  crossPromoTitle: "Khám phá thêm Nhà hàng & Quán ăn ngon tại Phan Thiết",
  crossPromoButtonText: "Xem thêm",
};

export type AmThucBannerSettingsData = typeof DEFAULT_AM_THUC_BANNER_SETTINGS;

const FIELD_KEYS = Object.keys(DEFAULT_AM_THUC_BANNER_SETTINGS) as (keyof AmThucBannerSettingsData)[];

// Doc cau hinh trang /am-thuc (banner dau trang + the Combo + 3 muc tin cay + con dau
// kiem chung + banner cuoi trang chi tiet mon an) - luon tra ve du truong (fallback ve
// DEFAULT cho tung truong rieng le neu admin chua dien), giong game-banner-settings.ts.
export async function getAmThucBannerSettings(): Promise<AmThucBannerSettingsData> {
  const row = await prisma.amThucBannerSettings.findUnique({ where: { id: SETTINGS_ID } }).catch(() => null);
  const result = {} as AmThucBannerSettingsData;
  for (const key of FIELD_KEYS) {
    (result[key] as string | null) = (row?.[key] as string | null | undefined) ?? DEFAULT_AM_THUC_BANNER_SETTINGS[key] ?? null;
  }
  return result;
}

export async function updateAmThucBannerSettings(data: Partial<AmThucBannerSettingsData>) {
  return prisma.amThucBannerSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}

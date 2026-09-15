import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export const DEFAULT_GAME_BANNER_SETTINGS = {
  heroBanner: "/images/banner-game.png",
  rewardBanner: null as string | null,
};

export type GameBannerSettingsData = typeof DEFAULT_GAME_BANNER_SETTINGS;

// Doc cau hinh banner trang Game trung thuong - heroBanner luon co gia tri (fallback
// ve anh mac dinh), rewardBanner co the null (nghia la dung SVG TreasureScene ve san
// trong RewardBanner.tsx, khong bat buoc phai co anh THAT).
export async function getGameBannerSettings(): Promise<GameBannerSettingsData> {
  const row = await prisma.gameBannerSettings.findUnique({ where: { id: SETTINGS_ID } }).catch(() => null);
  return {
    heroBanner: row?.heroBanner || DEFAULT_GAME_BANNER_SETTINGS.heroBanner,
    rewardBanner: row?.rewardBanner ?? DEFAULT_GAME_BANNER_SETTINGS.rewardBanner,
  };
}

export async function updateGameBannerSettings(data: Partial<GameBannerSettingsData>) {
  return prisma.gameBannerSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}

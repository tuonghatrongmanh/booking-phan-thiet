import { getGameBannerSettings } from "@/lib/game-banner-settings";
import GameBannerForm from "@/components/admin/GameBannerForm";

export const dynamic = "force-dynamic";

export default async function AdminGameBannersPage() {
  const settings = await getGameBannerSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800">Banner trang Game</h1>
        <p className="text-slate-400">
          Quản lý ảnh banner đầu trang và banner &quot;Tích xu hôm nay&quot; ở trang Game trúng thưởng.
        </p>
      </div>

      <GameBannerForm initial={settings} />
    </div>
  );
}

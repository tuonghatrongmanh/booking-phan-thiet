import { getAmThucBannerSettings } from "@/lib/am-thuc-banner-settings";
import AmThucBannerForm from "@/components/admin/AmThucBannerForm";

export const dynamic = "force-dynamic";

export default async function AdminAmThucBannerPage() {
  const settings = await getAmThucBannerSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800">Banner trang Ẩm thực</h1>
        <p className="text-slate-400">Quản lý ảnh banner, icon và tiêu đề ở đầu trang Ẩm thực.</p>
      </div>

      <AmThucBannerForm initial={settings} />
    </div>
  );
}

import { getSiteSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800">Cài đặt</h1>
        <p className="text-slate-400">Logo, favicon, nội dung footer và SEO trang chủ — áp dụng cho toàn bộ website.</p>
      </div>

      <SettingsForm initial={settings} />
    </div>
  );
}

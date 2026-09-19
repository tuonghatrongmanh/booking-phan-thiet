import { getSiteSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";
import PaymentSettingsForm from "@/components/admin/PaymentSettingsForm";
import TelegramTestCard from "@/components/admin/TelegramTestCard";
import SiteIdentityForm from "@/components/admin/SiteIdentityForm";
import { getPaymentSettings } from "@/lib/payment-settings";
import { getCurrentAdmin } from "@/lib/current-admin";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, paymentSettings, admin] = await Promise.all([getSiteSettings(), getPaymentSettings(), getCurrentAdmin()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800">Cài đặt</h1>
        <p className="text-slate-400">Logo, favicon, nội dung footer và SEO trang chủ — áp dụng cho toàn bộ website.</p>
      </div>

      <SettingsForm initial={settings} />

      <div className="mt-8">
        <SiteIdentityForm initial={settings} />
      </div>

      {admin?.role === "SUPER_ADMIN" && (
        <div className="mt-8">
          <PaymentSettingsForm initial={paymentSettings} />
        </div>
      )}

      {admin?.role === "SUPER_ADMIN" && (
        <div className="mt-8">
          <TelegramTestCard
            hasToken={Boolean(process.env.TELEGRAM_BOT_TOKEN)}
            hasChatId={Boolean(process.env.TELEGRAM_CHAT_ID)}
          />
        </div>
      )}
    </div>
  );
}

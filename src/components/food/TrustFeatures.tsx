import type { AmThucBannerSettingsData } from "@/lib/am-thuc-banner-settings";

export default function TrustFeatures({ settings }: { settings: AmThucBannerSettingsData }) {
  const features = [
    { icon: settings.trustIcon1, title: settings.trustTitle1, desc: settings.trustDesc1 },
    { icon: settings.trustIcon2, title: settings.trustTitle2, desc: settings.trustDesc2 },
    { icon: settings.trustIcon3, title: settings.trustTitle3, desc: settings.trustDesc3 },
  ];

  return (
    <div className="bg-white border border-[#EAF0F6] rounded-[18px] p-5 space-y-4">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-food-light text-food-primary flex items-center justify-center shrink-0">
            <i className={f.icon} aria-hidden="true" />
          </span>
          <div>
            <p className="font-bold text-sm text-food-text leading-tight">{f.title}</p>
            <p className="text-xs text-food-textMuted mt-0.5">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

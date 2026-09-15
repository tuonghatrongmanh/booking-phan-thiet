import type { AmThucBannerSettingsData } from "@/lib/am-thuc-banner-settings";

export default function PromotionBanner({ settings }: { settings: AmThucBannerSettingsData }) {
  return (
    <div
      className="relative rounded-[18px] overflow-hidden text-white p-5 sm:p-6 bg-cover bg-center"
      style={{ backgroundImage: `url('${settings.promoImage}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-food-navy/90 via-food-dark/85 to-food-primary/70" />

      <div className="relative">
        <p className="font-display font-extrabold text-xl leading-tight">{settings.promoTitle}</p>

        <div className="inline-flex items-center gap-2 mt-3 bg-white/15 backdrop-blur-sm rounded-full pl-1 pr-4 py-1">
          <span className="w-9 h-9 rounded-full bg-food-rating text-food-navy flex items-center justify-center text-xs font-extrabold shrink-0">
            %
          </span>
          <span className="text-sm font-bold">{settings.promoPrice}</span>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-white/90">
          {[settings.promoFeature1, settings.promoFeature2, settings.promoFeature3].filter(Boolean).map((item) => (
            <li key={item} className="flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-food-rating" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-5 w-full flex items-center justify-center gap-2 bg-food-primary hover:brightness-95 active:scale-[0.98] transition text-white text-sm font-bold rounded-full py-2.5"
        >
          {settings.promoButtonText} <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

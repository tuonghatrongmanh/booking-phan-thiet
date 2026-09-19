import Link from "next/link";
import type { AmThucBannerSettingsData } from "@/lib/am-thuc-banner-settings";

export default function HeroFood({ settings }: { settings: AmThucBannerSettingsData }) {
  return (
    <section
      className="relative h-[240px] sm:h-[280px] lg:h-[300px] bg-cover bg-center"
      style={{ backgroundImage: `url('${settings.heroBanner}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-food-navy/80 via-food-navy/55 to-food-navy/85" />

      <div className="relative container-custom h-full flex flex-col justify-center pb-6">
        <nav className="text-[13px] text-white/75 font-semibold flex items-center gap-1.5 mb-3">
          <Link href="/" className="hover:text-white transition-colors">
            Trang chủ
          </Link>
          <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
          <span className="text-white">Ẩm thực</span>
        </nav>

        <span className="inline-flex items-center gap-2 bg-white/18 text-white text-sm font-bold px-4 py-2 rounded-full mb-3 w-fit">
          <i className={settings.badgeIcon} aria-hidden="true" /> {settings.badgeText}
        </span>

        {/* Chỉ giữ 1 dòng tiêu đề: dòng thứ 2 (chữ xanh trên nền xanh đậm) và đoạn mô tả bị che/cắt trên điện thoại nên đã bỏ */}
        <h1 className="font-display font-extrabold text-white leading-tight text-[30px] sm:text-[40px] lg:text-[48px]">
          {settings.headingTop.replace(/[,，]\s*$/, "")}
        </h1>
      </div>
    </section>
  );
}

import Image from "next/image";
import { prisma } from "@/lib/prisma";
import AISearchBox from "./AISearchBox";

const TRUST_BADGES = [
  { id: "hero.badge1", icon: "fa-solid fa-location-dot", label: "Mã thật – Giảm thật", badge: "bg-blue-500" },
  { id: "hero.badge2", icon: "fa-solid fa-tags", label: "Tiết kiệm đến 50%", badge: "bg-amber-500" },
  { id: "hero.badge3", icon: "fa-solid fa-clock", label: "Cập nhật mỗi ngày", badge: "bg-blue-500" },
  { id: "hero.badge4", icon: "fa-solid fa-headset", label: "Hỗ trợ 24/7", badge: "bg-blue-500" },
];

type Tile = {
  id: string;
  label: string;
  tagText: string;
  href: string;
  image: string;
  icon: string;
  badgeColor: string;
  special: boolean;
};

function QuickCategoryTile({ t, delay }: { t: Tile; delay: number }) {
  return (
    <div
      className="group animate-fade-up bg-white rounded-2xl shadow-md hover-lift overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative p-2 pb-4">
        <div
          className={`relative aspect-square rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center ${
            t.special ? "animate-lights-blink" : ""
          }`}
        >
          <Image src={t.image} alt={t.label} fill sizes="(max-width: 640px) 25vw, 160px" className="object-cover" />
          {t.special && (
            <span className="absolute top-1.5 right-1.5 bg-brand-gold text-[8px] font-extrabold text-slate-900 px-1.5 py-0.5 rounded-full z-10">
              HOT
            </span>
          )}
        </div>
        <span
          className="absolute -bottom-1 left-4 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white text-white text-sm"
          style={{ backgroundColor: t.badgeColor }}
        >
          <i className={t.icon} aria-hidden="true" />
        </span>
      </div>
      <div className="px-2 pb-3 text-center">
        <p className="text-xs font-bold text-slate-700 leading-tight">{t.label}</p>
        <p
          className="text-[10px] font-bold mt-1.5 rounded-full px-1.5 py-0.5 mx-auto w-fit"
          style={{ backgroundColor: `${t.badgeColor}1a`, color: t.badgeColor }}
        >
          {t.tagText}
        </p>
      </div>
    </div>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default async function Hero() {
  const tilesRaw = await prisma.heroTile.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  const tiles: Tile[] = tilesRaw.map((t) => ({
    id: t.id,
    label: t.label,
    tagText: t.tagText,
    href: t.href,
    image: t.image,
    icon: t.icon,
    badgeColor: t.badgeColor,
    special: t.special,
  }));

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/banner.png"
          alt="Phan Thiết biển và hải đăng"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/20 to-white/40" />
      </div>

      <div className="container-custom pt-6 pb-10 lg:pt-8 lg:pb-14 relative z-10">
        {/* heading row + game panel */}
        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-4 lg:gap-6 items-stretch">
          <div className="animate-fade-up flex flex-col justify-center py-2">
            <div className="relative mb-8">
              <div className="absolute -inset-x-16 -inset-y-20 bg-white/70 blur-3xl rounded-[50%] -z-10" />
              <div className="absolute -inset-x-10 -inset-y-10 bg-white/70 blur-2xl rounded-[50%] -z-10" />
              <div className="absolute -inset-x-4 -inset-y-4 bg-white/55 blur-lg rounded-[50%] -z-10" />
              <p className="text-pop-white text-brand-blue font-extrabold italic text-lg sm:text-3xl lg:text-[34px] mb-3 sm:mb-4">
                Săn ưu đãi – Trải nghiệm tuyệt vời
              </p>
              <h1 className="font-display font-extrabold text-[1.5rem] sm:text-[3.1rem] lg:text-[3.5rem] leading-[1.25] tracking-tight mb-4 sm:mb-5 lg:whitespace-nowrap">
                <span className="text-pop-white block text-brand-blue">Homestay, Villa, Quán nhậu,</span>
                <span className="text-pop-white block text-brand-orange">Quán cà phê, Khu du lịch</span>
              </h1>
              <p className="text-pop-white italic text-brand-blue font-bold text-base sm:text-2xl">
                Đặt qua BookingPhanThiet.com
              </p>
            </div>

            {/* trust badges */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:flex-nowrap lg:gap-2.5">
              {TRUST_BADGES.map((b) => (
                <span
                  key={b.label}
                  className="flex items-center gap-2 bg-white rounded-full pl-1.5 pr-3 sm:pr-3.5 py-1.5 text-[12.5px] sm:text-sm font-bold text-slate-700 shadow sm:whitespace-nowrap"
                >
                  <span className={`w-7 h-7 rounded-full ${b.badge} text-white flex items-center justify-center text-xs shrink-0`}>
                    <i className={b.icon} aria-hidden="true" />
                  </span>
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: Game trúng thưởng — ảnh bảng game + nút CHƠI NGAY động đè lên vị trí nút gốc */}
          <div className="relative animate-fade-up [animation-delay:150ms] flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[680px] rounded-[28px] overflow-hidden">
              <img
                src="/images/game-wheel-banner.png"
                alt="Game trúng thưởng - Quay là trúng, 100% có quà"
                className="w-full h-auto select-none pointer-events-none block"
              />
              <div className="absolute left-[29%] top-[63%] w-[42%] aspect-[15/4.2]">
                {/* lớp nền tĩnh phủ kín vị trí nút gốc, để khi nút động nhấp nhô không lộ ảnh cũ bên dưới */}
                <div className="absolute -inset-1 rounded-full bg-[#0b1f4d]" />
                <button
                  className="absolute inset-0 rounded-full overflow-hidden animate-gem-bounce hover:brightness-110 active:scale-95 transition"
                  aria-label="Chơi ngay"
                >
                  <img
                    src="/images/choi-ngay-button.png"
                    alt="Chơi ngay"
                    className="absolute inset-0 w-full h-full object-cover scale-125"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* full-width AI assistant card */}
        <div className="mt-6">
          <AISearchBox />
        </div>

        {/* quick category — mobile: carousel phân trang 2 cột x 2 dòng, vuốt trái/phải */}
        <div className="sm:hidden mt-8 -mx-6 px-6">
          <div className="flex items-start overflow-x-auto scrollbar-none snap-x snap-mandatory gap-0 py-2">
            {chunk(tiles, 4).map((page, pi) => (
              <div key={pi} className="shrink-0 w-full snap-start grid grid-cols-2 gap-3 pr-3">
                {page.map((t, i) => (
                  <QuickCategoryTile key={t.id} t={t} delay={(pi * 4 + i) * 70} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* quick category — tablet/desktop: lưới phẳng */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8">
          {tiles.map((t, i) => (
            <QuickCategoryTile key={t.id} t={t} delay={i * 70} />
          ))}
        </div>
      </div>
    </section>
  );
}

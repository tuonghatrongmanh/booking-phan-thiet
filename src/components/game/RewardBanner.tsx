
// Banner CTA cuoi trang - minh hoa ruong bau vat + xu + voucher + hang dua + song
// bien (SVG ve rieng, khong dung anh ngoai) - dung khi admin CHUA upload anh THAT
// qua /admin/game-banners (xem GameBannerForm.tsx).
function TreasureScene() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="rbBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1689d8" />
          <stop offset="100%" stopColor="#08345f" />
        </linearGradient>
      </defs>
      <rect width="1200" height="300" fill="url(#rbBg)" />

      <path d="M0 210 Q150 190 300 210 T600 205 T900 212 T1200 205 V300 H0 Z" fill="#25a9e8" opacity="0.35" />
      <path d="M0 230 Q200 215 400 230 T800 226 T1200 230 V300 H0 Z" fill="#0e6fb8" opacity="0.5" />

      <g transform="translate(60,300)" fill="#0f7a3d" opacity="0.9">
        <path d="M0 0 C-38 -55 -16 -125 38 -152 C10 -98 10 -42 26 -6 Z" />
        <path d="M0 0 C8 -62 50 -116 108 -124 C66 -90 42 -42 36 -4 Z" />
      </g>

      {/* ruong bau vat */}
      <g transform="translate(190,225)">
        <rect x="-55" y="-10" width="110" height="42" rx="6" fill="#7B4B25" />
        <path d="M-55 -10 a55 26 0 0 1 110 0 Z" fill="#9a6435" />
        <rect x="-8" y="-6" width="16" height="10" rx="2" fill="#FFC928" />
        <circle cx="-30" cy="-22" r="9" fill="#FFC928" />
        <circle cx="-8" cy="-30" r="10" fill="#FFC928" />
        <circle cx="16" cy="-24" r="8" fill="#FFC928" />
        <circle cx="32" cy="-14" r="7" fill="#FF9F1C" />
      </g>

      {/* voucher card */}
      <g transform="translate(330,200) rotate(-8)">
        <rect x="0" y="0" width="70" height="42" rx="6" fill="#fff" />
        <rect x="0" y="0" width="70" height="42" rx="6" fill="none" stroke="#FFC928" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="0" cy="21" r="5" fill="#08345f" />
        <circle cx="70" cy="21" r="5" fill="#08345f" />
        <text x="35" y="26" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1689d8">%</text>
      </g>
    </svg>
  );
}

export default function RewardBanner({ image }: { image?: string | null }) {
  if (image) {
    return (
      <section className="max-w-[1340px] mx-auto px-6 pb-16 lg:pb-[72px]">
        {/* Anh THAT admin upload thuong tu co san text/CTA rieng trong anh (poster thiet
           ke san) - khong de text/nut/lop mo cua component nay len tren nua, chi hien
           dung anh dung ty le goc (khong crop). */}
        {/* eslint-disable-next-line @next/next/no-img-element -- can kich thuoc goc cua anh, khong ep vao khung fill co dinh nhu Next Image */}
        <img src={image} alt="" className="w-full h-auto rounded-[24px]" />
      </section>
    );
  }

  return (
    <section className="max-w-[1340px] mx-auto px-6 pb-16 lg:pb-[72px]">
      <div className="relative rounded-[24px] overflow-hidden min-h-[260px] sm:min-h-[280px] flex items-center">
        <TreasureScene />
        <div className="relative z-10 w-full px-8 sm:px-12 lg:px-16 py-12 text-center sm:text-left">
          <div className="sm:max-w-lg">
            <h2 className="font-display font-extrabold text-white text-[26px] sm:text-[32px] leading-snug mb-3">
              Tích xu hôm nay – <span className="text-game-yellow">nhận quà liền tay!</span>
            </h2>
            <p className="text-white/85 text-base mb-6">
              Đừng bỏ lỡ cơ hội nhận voucher, mã giảm giá và quà tặng hấp dẫn.
            </p>
            <a
              href="#danh-sach-game"
              className="inline-flex items-center gap-2 bg-white text-game-deep font-bold rounded-full px-7 py-3.5 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            >
              <i className="fa-solid fa-play" aria-hidden="true" /> Bắt đầu chơi ngay
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

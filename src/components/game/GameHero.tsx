import Image from "next/image";

export default function GameHero({ banner }: { banner: string }) {
  return (
    <section className="relative w-full min-h-[420px] sm:min-h-[440px] lg:min-h-[460px] overflow-hidden">
      <Image src={banner} alt="" fill priority sizes="100vw" className="object-cover" />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(8,52,95,.55), rgba(8,52,95,.15))" }}
      />

      <div className="relative max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12 h-full flex items-center py-14">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 bg-white/18 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">
            <i className="fa-solid fa-gamepad" aria-hidden="true" /> GAME TRÚNG THƯỞNG
          </span>

          <h1
            className="font-display font-extrabold text-white text-[38px] sm:text-[48px] lg:text-[58px] leading-[1.05] mb-4"
            style={{ textShadow: "0 4px 15px rgba(0,0,0,.15)" }}
          >
            Chơi game nhỏ
            <br />
            <span className="text-game-yellow">Nhận quà lớn!</span>
          </h1>

          <p className="text-white/90 text-base sm:text-lg leading-relaxed max-w-md mb-7">
            Tham gia các trò chơi thú vị, tích xu đổi voucher, nhận quà hấp dẫn ngay trên Booking Phan Thiết!
          </p>

          <a
            href="#danh-sach-game"
            className="inline-flex items-center gap-2 bg-white text-game-deep font-bold rounded-full px-7 py-3.5 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          >
            <i className="fa-solid fa-gamepad" aria-hidden="true" /> Khám phá ngay <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

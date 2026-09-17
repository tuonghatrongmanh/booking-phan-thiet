// Hero rieng cho trang Thue xe - dung gradient bien + hoa van song/dua bang SVG thay vi
// anh chup (khong co san anh phong canh bien thuc trong /public/images phu hop), giu
// dung tinh than "coastal travel" ma khong phai ghep 1 anh khong khop chat luong.
export default function RentalHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 h-[190px] sm:h-[210px] lg:h-[225px] flex items-center">
      {/* hoa van song trang trí, khong che chu */}
      <div className="absolute inset-0 opacity-[0.15]" aria-hidden="true">
        <svg className="absolute -top-6 -right-10 w-64 h-64 text-white" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <svg
        className="absolute bottom-0 left-0 w-full text-white/10"
        viewBox="0 0 1440 80"
        fill="currentColor"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 40 Q 360 0 720 40 T 1440 40 V80 H0 Z" />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-full text-white/[0.14]"
        viewBox="0 0 1440 60"
        fill="currentColor"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 30 Q 480 60 960 20 T 1440 30 V60 H0 Z" />
      </svg>

      <div className="relative z-10 container-custom text-center">
        <h1 className="font-display font-extrabold text-[28px] sm:text-[36px] lg:text-[42px] leading-[1.15] text-white flex items-center justify-center gap-2.5 drop-shadow-sm">
          <i className="fa-solid fa-motorcycle text-[0.85em]" aria-hidden="true" />
          Thuê xe máy Phan Thiết
        </h1>
        <p className="text-white/90 text-[15px] sm:text-base mt-2.5 max-w-xl mx-auto">
          Xe số, xe tay ga, Vision, SH, các dòng xe đời mới... giá ngày thường/ngày lễ rõ ràng, giao nhận tận nơi
        </p>
      </div>
    </section>
  );
}

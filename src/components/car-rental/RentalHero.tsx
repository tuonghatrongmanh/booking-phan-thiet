import Link from "next/link";
import Image from "next/image";

// Hero trang Thuê xe: nền ảnh + lớp phủ xanh đậm để chữ TRẮNG luôn rõ nét (bản cũ dùng chữ tối có viền
// trắng nên bị nhòe). Phần đệm dưới đủ lớn để ô tìm kiếm (kéo đè lên hero) không che nội dung.
const TRUST_POINTS = [
  { icon: "fa-solid fa-truck-fast", text: "Giao nhận tận nơi" },
  { icon: "fa-solid fa-tags", text: "Giá ngày thường / ngày lễ rõ ràng" },
  { icon: "fa-solid fa-qrcode", text: "Cọc giữ xe nhanh bằng QR" },
];

export default function RentalHero() {
  return (
    <div className="relative overflow-hidden bg-brand-footer">
      <Image src="/images/danhmuc-thuexe.png" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-footer/95 via-brand-footer/75 to-brand-footer/25" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-footer/50 to-transparent" aria-hidden="true" />

      <div className="relative container-custom pt-6 pb-[160px] sm:pb-[112px]">
        <nav className="text-xs text-white/75 mb-5 flex items-center gap-1.5 font-semibold" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition">
            Trang chủ
          </Link>
          <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
          <span className="text-white">Thuê xe</span>
        </nav>

        <div className="max-w-[560px]">
          <h1 className="flex items-center gap-3 font-display font-extrabold text-[28px] sm:text-[38px] leading-tight text-white">
            <span className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-brand-gold text-xl sm:text-2xl">
              <i className="fa-solid fa-motorcycle" aria-hidden="true" />
            </span>
            <span>
              Thuê xe máy <span className="text-brand-gold">Phan Thiết</span>
            </span>
          </h1>
          <p className="text-white/85 text-sm sm:text-base leading-relaxed mt-3">
            Xe số, xe tay ga, Vision, SH và các dòng xe đời mới - giá rõ ràng, đặt cọc nhanh, giao nhận tận nơi.
          </p>

          <ul className="flex flex-wrap gap-2 mt-4">
            {TRUST_POINTS.map((p) => (
              <li key={p.text} className="inline-flex items-center gap-1.5 bg-white/12 border border-white/20 text-white text-xs sm:text-[13px] font-semibold rounded-full px-3 py-1.5">
                <i className={`${p.icon} text-brand-gold`} aria-hidden="true" /> {p.text}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2.5 mt-5">
            <a
              href="#danh-sach-xe"
              className="inline-flex items-center gap-2 bg-brand-gold text-brand-footer font-extrabold text-sm rounded-full px-5 py-2.5 hover:brightness-105 transition"
            >
              Xem xe cho thuê <i className="fa-solid fa-arrow-down text-xs" aria-hidden="true" />
            </a>
            <Link
              href="/tra-cuu-dat-cho"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-bold text-sm rounded-full px-5 py-2.5 hover:bg-white/20 transition"
            >
              <i className="fa-solid fa-magnifying-glass text-xs" aria-hidden="true" /> Tra cứu đơn đã đặt
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

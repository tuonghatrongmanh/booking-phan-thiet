import Link from "next/link";
import Image from "next/image";

export default function RentalHero() {
  return (
    <div className="relative h-[300px] sm:h-[230px] overflow-hidden">
      <Image src="/images/danhmuc-thuexe.png" alt="Thuê xe máy Phan Thiết" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />
      <div className="absolute inset-0 bg-brand-sky/10" />

      <div className="relative h-full container-custom flex flex-col justify-start pt-6">
        <nav className="text-outline-white text-xs text-slate-600 mb-2 flex items-center gap-1.5 font-semibold">
          <Link href="/" className="hover:text-brand-blue transition">
            Trang chủ
          </Link>
          <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
          <span className="text-slate-700">Thuê xe</span>
        </nav>

        <div className="max-w-[500px]">
          <h1 className="text-outline-white font-display font-extrabold text-2xl sm:text-[34px] leading-tight flex items-center gap-2.5">
            <i className="fa-solid fa-motorcycle text-brand-blue" aria-hidden="true" />
            <span>
              <span className="text-navy-DEFAULT">Thuê xe máy</span> <span className="text-brand-blue">Phan Thiết</span>
            </span>
          </h1>
          <p className="text-outline-white text-slate-600 text-sm mt-1.5">
            Xe số, xe tay ga, Vision, SH, các dòng xe đời mới - giá ngày thường/ngày lễ rõ ràng, giao nhận tận nơi
          </p>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function RentalCTA() {
  return (
    <section className="container-custom pb-10 sm:pb-14">
      <div className="relative bg-gradient-to-br from-brand-blue to-brand-blueLight rounded-3xl px-6 sm:px-10 py-10 sm:py-14 text-center overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-14 -left-10 w-56 h-56 rounded-full bg-white/10" />
        <div className="relative">
          <p className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">Sẵn sàng cho chuyến đi của bạn?</p>
          <p className="text-brand-sky mb-6 max-w-[520px] mx-auto">
            Chọn ngay chiếc xe phù hợp và gửi yêu cầu đặt thuê - chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.
          </p>
          <Link
            href="#danh-sach-xe"
            className="inline-flex items-center gap-2 bg-white text-brand-blue font-bold rounded-xl px-6 py-3 hover:bg-brand-tint transition"
          >
            <i className="fa-solid fa-motorcycle" aria-hidden="true" />
            Xem danh sách xe
          </Link>
        </div>
      </div>
    </section>
  );
}

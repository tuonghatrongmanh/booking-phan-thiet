const BENEFITS = [
  {
    icon: "fa-solid fa-motorcycle",
    title: "Xe mới, bảo dưỡng định kỳ",
    desc: "Toàn bộ xe được kiểm tra, bảo dưỡng trước mỗi lượt thuê, đảm bảo vận hành ổn định.",
  },
  {
    icon: "fa-solid fa-hand-holding-dollar",
    title: "Giá minh bạch, không phí ẩn",
    desc: "Báo giá rõ ngày/mùa vụ, không phát sinh chi phí bất ngờ khi nhận xe.",
  },
  {
    icon: "fa-solid fa-location-dot",
    title: "Giao nhận tại vị trí bạn chọn",
    desc: "Hỗ trợ giao xe tại khách sạn, homestay hoặc điểm hẹn trong khu vực Phan Thiết - Mũi Né.",
  },
  {
    icon: "fa-solid fa-headset",
    title: "Hỗ trợ 24/7",
    desc: "Đội ngũ sẵn sàng hỗ trợ khi bạn cần đổi xe, sửa chữa hoặc tư vấn lộ trình.",
  },
];

export default function RentalBenefits() {
  return (
    <section className="container-custom py-10 sm:py-14">
      <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-800 text-center mb-8">Vì sao nên thuê xe tại đây</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {BENEFITS.map((b) => (
          <div key={b.title} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-brand-sky/40 text-brand-blue flex items-center justify-center mx-auto mb-3 text-xl">
              <i className={b.icon} aria-hidden="true" />
            </div>
            <p className="font-bold text-slate-800 mb-1.5">{b.title}</p>
            <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  {
    num: 1,
    icon: "fa-solid fa-magnifying-glass",
    title: "Chọn xe phù hợp",
    desc: "Lọc theo loại xe, thương hiệu, giá và tình trạng còn xe để tìm chiếc xe bạn cần.",
  },
  {
    num: 2,
    icon: "fa-solid fa-calendar-check",
    title: "Gửi yêu cầu đặt xe",
    desc: "Điền ngày nhận/trả xe, khu vực nhận xe và thông tin liên hệ - chỉ mất vài phút.",
  },
  {
    num: 3,
    icon: "fa-solid fa-key",
    title: "Nhận xe và khởi hành",
    desc: "Nhân viên liên hệ xác nhận, bạn nhận xe tại vị trí đã hẹn và bắt đầu chuyến đi.",
  },
];

export default function RentalSteps() {
  return (
    <section className="bg-brand-sky/20 py-10 sm:py-14">
      <div className="container-custom">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-800 text-center mb-8">Thuê xe chỉ với 3 bước</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.num} className="bg-white rounded-2xl p-6 shadow-sm text-center relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-blue text-white text-sm font-bold flex items-center justify-center">
                {s.num}
              </div>
              <div className="w-14 h-14 rounded-full bg-brand-sky/40 text-brand-blue flex items-center justify-center mx-auto mb-3 text-2xl">
                <i className={s.icon} aria-hidden="true" />
              </div>
              <p className="font-bold text-slate-800 mb-1.5">{s.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


const FEATURES = [
  {
    id: "transparency",
    bg: "bg-brand-sky",
    title: "Thông tin minh bạch",
    desc: "Dữ liệu được xác minh và cập nhật liên tục từ đối tác uy tín.",
    link: "Tìm hiểu thêm",
    linkClass: "text-brand-blue border-brand-blueMid bg-brand-tint hover:bg-brand-sky",
    bgImage: "/images/feature-minhbach.png",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 2.5l7.5 3.2v5.4c0 5.2-3.2 8.9-7.5 10.4-4.3-1.5-7.5-5.2-7.5-10.4V5.7L12 2.5z" fill="var(--theme-primary)" />
        <path d="M8.3 12.2l2.6 2.6 5-5.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "reviews",
    bg: "bg-amber-100",
    title: "Đánh giá thực tế",
    desc: "Review chân thực từ cộng đồng du lịch tại Phan Thiết.",
    link: "Xem đánh giá",
    linkClass: "text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100",
    bgImage: "/images/feature-danhgia.png",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 2.2l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 16.9 6.2 20.2l1.1-6.5-4.8-4.6 6.6-.9L12 2.2z" fill="#f59e0b" />
        <circle cx="18.5" cy="5.5" r="1.6" fill="#ffd873" />
        <circle cx="4.5" cy="9" r="1" fill="#ffd873" />
      </svg>
    ),
  },
  {
    id: "scam",
    bg: "bg-red-100",
    title: "Cảnh báo lừa đảo",
    desc: "Hệ thống cảnh báo tự động giúp bạn tránh rủi ro khi đặt dịch vụ.",
    link: "Xem cảnh báo",
    linkClass: "text-brand-red border-red-200 bg-red-50 hover:bg-red-100",
    bgImage: "/images/feature-canhbao.png",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 2.8l10 17.6H2L12 2.8z" fill="#e8483a" />
        <rect x="11" y="9" width="2" height="6" rx="1" fill="#fff" />
        <circle cx="12" cy="17" r="1.15" fill="#fff" />
      </svg>
    ),
  },
  {
    id: "refund",
    bg: "bg-violet-100",
    title: "Hoàn tiền hỗ trợ",
    desc: "Hướng dẫn & hỗ trợ lấy lại tiền khi gặp sự cố.",
    link: "Tìm hiểu thêm",
    linkClass: "text-violet-600 border-violet-200 bg-violet-50 hover:bg-violet-100",
    bgImage: "/images/feature-hoantien.png",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="13" rx="8" ry="7.2" fill="#8b5ce0" />
        <path d="M9 8.3C9 6.5 12 4 15 5.6" stroke="#8b5ce0" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <text x="12" y="16.5" fontSize="9" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="sans-serif">
          $
        </text>
      </svg>
    ),
  },
];

export default function FeatureCards() {
  return (
    <section className="container-custom -mt-2 py-10">
      <div data-swipe-hint className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory -mx-6 px-6 py-3 sm:mx-0 sm:px-0 sm:py-0 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 sm:gap-5">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="relative overflow-hidden bg-white rounded-2xl shadow-card p-5 hover-lift animate-fade-up shrink-0 w-[82%] snap-start sm:w-auto sm:shrink"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <div
              aria-hidden="true"
              className="absolute -right-2 -bottom-2 w-28 h-28 bg-contain bg-no-repeat bg-right-bottom opacity-90 pointer-events-none"
              style={{ backgroundImage: `url(${f.bgImage})` }}
            />
            <div className="relative">
              <div className={`w-12 h-12 rounded-full ${f.bg} flex items-center justify-center mb-3`}>
                {f.icon}
              </div>
              <p className="font-display font-bold text-slate-800 mb-1">
                {f.title}
              </p>
              <p className="text-sm text-slate-400 mb-3 max-w-[75%]">
                {f.desc}
              </p>
              <a
                href="#"
                className={`inline-block text-xs font-bold border rounded-full px-3 py-1.5 transition-colors duration-200 ${f.linkClass}`}
              >
                {f.link}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

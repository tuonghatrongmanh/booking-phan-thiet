
type CategoryItem = {
  id: string;
  label: string;
  desc: string;
  count: number;
  href: string;
  photoImg: string;
  overlay: string;
  icon: React.ReactNode;
  iconColor: string;
};

export default function CategorySection({
  counts,
}: {
  counts: { homestay: number; carRental: number; restaurant: number; attraction: number };
}) {
  const categories: CategoryItem[] = [
    {
      id: "homestay",
      label: "Homestay",
      desc: "Địa điểm lưu trú uy tín, thoải mái",
      count: counts.homestay,
      href: "/luu-tru",
      photoImg: "/images/danhmuc-homestay.png",
      overlay: "from-blue-950/85 via-blue-950/25",
      iconColor: "#1a6fc4",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 11l9-7 9 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "carRental",
      label: "Thuê xe máy",
      desc: "Dịch vụ thuê xe chất lượng, giá tốt",
      count: counts.carRental,
      href: "/thue-xe",
      photoImg: "/images/danhmuc-thuexe.png",
      overlay: "from-emerald-950/85 via-emerald-950/25",
      iconColor: "#1ea34c",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="17" r="2.4" stroke="currentColor" strokeWidth="2" />
          <circle cx="18" cy="17" r="2.4" stroke="currentColor" strokeWidth="2" />
          <path d="M4 17V9l2-4h9l3 5h2v7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M8.2 17h7.6M6 9h11" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: "restaurant",
      label: "Quán ăn ngon",
      desc: "Địa điểm ăn uống được yêu thích",
      count: counts.restaurant,
      href: "/am-thuc",
      photoImg: "/images/danhmuc-quanan.png",
      overlay: "from-orange-950/85 via-orange-950/25",
      iconColor: "#f5821f",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M6 3v7a2 2 0 0 0 2 2v9M6 3v7M9 3v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 3c-1.7 0-3 2-3 5.5S15 12 16 12v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "attraction",
      label: "Điểm tham quan",
      desc: "Vui chơi, check-in không thể bỏ lỡ",
      count: counts.attraction,
      href: "/diem-tham-quan",
      photoImg: "/images/danhmuc-diemthamquan.png",
      overlay: "from-purple-950/85 via-purple-950/25",
      iconColor: "#8b5ce0",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
          <path d="M12 3.5V12l6 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <section className="container-custom py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-800 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#1a6fc4">
            <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
          </svg>
          DANH MỤC TRA CỨU PHỔ BIẾN
        </h2>
        <a
          href="#"
          className="text-sm font-bold text-brand-blue border border-sky-200 rounded-full px-4 py-1.5 hover:bg-sky-50 transition-colors"
        >
          Xem tất cả danh mục
        </a>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory -mx-6 px-6 py-3 sm:mx-0 sm:px-0 sm:py-0 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 sm:gap-5">
        {categories.map((c, i) => (
          <a
            key={c.label}
            href={c.href}
            className="group relative overflow-hidden rounded-2xl shadow-card h-56 hover-lift animate-fade-up bg-slate-200 shrink-0 w-[82%] snap-start sm:w-auto sm:shrink"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${c.photoImg})` }}
            />
            <div className={`absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t ${c.overlay} to-transparent`} />

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg shrink-0" style={{ color: c.iconColor }}>
                  {c.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-display font-bold text-white text-base leading-tight truncate">
                    {c.label}
                  </p>
                  <p className="text-white/80 text-xs truncate">
                    {c.desc}
                  </p>
                  <p className="text-white/90 text-xs font-semibold mt-0.5">
                    {c.count.toLocaleString("vi-VN")} địa điểm
                  </p>
                </div>
              </div>
              <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg shrink-0 text-slate-700 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

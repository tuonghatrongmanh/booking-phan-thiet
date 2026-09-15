import Link from "next/link";

// Danh muc dung DUNG 4 category thuc te co trong model News (Kinh nghiem/Dia diem/
// Am thuc/Trai nghiem) - KHONG bia them "Homestay/Thue xe may/Vui choi/Su kien" nhu
// trong anh mau vi do khong phai gia tri category thuc su ton tai trong DB.
const CATEGORY_ICON: Record<string, string> = {
  "Kinh nghiệm": "fa-solid fa-compass",
  "Địa điểm": "fa-solid fa-location-dot",
  "Ẩm thực": "fa-solid fa-utensils",
  "Trải nghiệm": "fa-solid fa-camera-retro",
};

export type CategoryCount = { name: string; count: number };

export default function BlogCategorySidebar({
  categories,
  totalCount,
  activeCategory,
}: {
  categories: CategoryCount[];
  totalCount: number;
  activeCategory?: string;
}) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[24px] p-6 shadow-blog-card">
        <p className="flex items-center gap-2 font-display font-bold text-blog-primaryDark mb-4">
          <i className="fa-solid fa-leaf" aria-hidden="true" /> Danh mục
        </p>

        <nav className="space-y-1.5">
          <Link
            href="/tin-tuc"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              !activeCategory ? "bg-blog-primary text-white" : "bg-white text-slate-600 hover:bg-blog-primaryBg"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <i className="fa-solid fa-house" aria-hidden="true" /> Tất cả bài viết
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                !activeCategory ? "bg-white/20" : "bg-slate-100 text-slate-500"
              }`}
            >
              {totalCount}
            </span>
          </Link>

          {categories.map((c) => {
            const isActive = activeCategory === c.name;
            return (
              <Link
                key={c.name}
                href={`/tin-tuc?category=${encodeURIComponent(c.name)}`}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  isActive ? "bg-blog-primary text-white" : "bg-white text-slate-600 hover:bg-blog-primaryBg"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <i className={CATEGORY_ICON[c.name] ?? "fa-solid fa-tag"} aria-hidden="true" /> {c.name}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {c.count}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="bg-blog-cream rounded-[24px] p-5 text-center relative overflow-hidden">
        <i className="fa-solid fa-tree text-amber-700/25 text-3xl absolute top-3 left-3" aria-hidden="true" />
        <i className="fa-solid fa-image text-amber-700/20 text-4xl absolute -bottom-1 -right-1 rotate-6" aria-hidden="true" />
        <i className="fa-solid fa-mobile-screen text-amber-700 text-2xl mb-2" aria-hidden="true" />
        <p className="font-display font-bold text-slate-700 text-sm mb-3 leading-snug">
          Bạn có trải nghiệm
          <br />
          thật tuyệt vời tại Phan Thiết?
        </p>
        <Link
          href="/nghi-duong"
          className="inline-flex items-center gap-1.5 bg-blog-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:brightness-95 transition"
        >
          <i className="fa-regular fa-comment-dots" aria-hidden="true" /> Chia sẻ ngay
        </Link>
      </div>
    </div>
  );
}

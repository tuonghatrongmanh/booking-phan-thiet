import Link from "next/link";
import ArticleSectionTitle from "@/components/news/ArticleSectionTitle";

const SERVICES = [
  { icon: "fa-solid fa-motorcycle", label: "Thuê xe máy", href: "/thue-xe" },
  { icon: "fa-solid fa-house", label: "Homestay", href: "/luu-tru" },
  { icon: "fa-solid fa-campground", label: "Camping", href: "/luu-tru" },
  { icon: "fa-solid fa-utensils", label: "Ăn uống", href: "/am-thuc" },
  { icon: "fa-solid fa-car", label: "Thuê xe du lịch", href: "/thue-xe" },
];

export default function RelatedServices() {
  return (
    <div>
      <ArticleSectionTitle icon="fa-solid fa-bell-concierge">Dịch vụ dành cho bạn</ArticleSectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {SERVICES.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex flex-col items-center gap-2 bg-food-light rounded-2xl p-4 hover-lift text-center"
          >
            <span className="w-11 h-11 rounded-full bg-white text-food-primary flex items-center justify-center text-lg">
              <i className={s.icon} aria-hidden="true" />
            </span>
            <span className="text-sm font-bold text-food-text">{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

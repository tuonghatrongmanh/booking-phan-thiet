import Link from "next/link";

const SERVICES = [
  { icon: "fa-solid fa-motorcycle", label: "Thuê xe máy", href: "/luu-tru" },
  { icon: "fa-solid fa-house", label: "Homestay", href: "/luu-tru" },
  { icon: "fa-solid fa-campground", label: "Camping", href: "/luu-tru" },
  { icon: "fa-solid fa-utensils", label: "Ăn uống", href: "/am-thuc" },
  { icon: "fa-solid fa-car", label: "Thuê xe du lịch", href: "/luu-tru" },
];

export default function RelatedServices() {
  return (
    <div className="mt-10">
      <p className="font-display font-bold text-lg text-slate-800 mb-4">Dịch vụ dành cho bạn</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {SERVICES.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex flex-col items-center gap-2 bg-white border border-slate-100 shadow-card rounded-2xl p-4 hover-lift text-center"
          >
            <span className="w-11 h-11 rounded-xl bg-brand-sky text-brand-blue flex items-center justify-center text-lg">
              <i className={s.icon} aria-hidden="true" />
            </span>
            <span className="text-sm font-bold text-slate-700">{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

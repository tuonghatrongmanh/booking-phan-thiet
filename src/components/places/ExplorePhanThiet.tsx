import Link from "next/link";
import Image from "next/image";

const TILES = [
  {
    icon: "fa-solid fa-umbrella-beach",
    title: "Mũi Né",
    desc: "Thiên đường biển và đồi cát",
    image: "/images/danhmuc-homestay.png",
    href: "/luu-tru?area=Mũi Né",
  },
  {
    icon: "fa-solid fa-utensils",
    title: "Ẩm thực Phan Thiết",
    desc: "Khám phá những món ngon địa phương",
    image: "/images/danhmuc-quanan.png",
    href: "/am-thuc",
  },
  {
    icon: "fa-solid fa-mountain-sun",
    title: "Địa điểm tham quan",
    desc: "Những nơi không thể bỏ lỡ",
    image: "/images/danhmuc-diemthamquan.png",
    href: "/luu-tru#kham-pha-phan-thiet",
  },
  {
    icon: "fa-solid fa-people-group",
    title: "Trải nghiệm",
    desc: "Những hoạt động thú vị cùng cộng đồng",
    image: "/images/banner-forum.png",
    href: "/nghi-duong",
  },
];

export default function ExplorePhanThiet() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {TILES.map((t) => (
        <Link
          key={t.title}
          href={t.href}
          className="group relative rounded-[18px] overflow-hidden h-[280px] sm:h-[300px] hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(16,60,100,0.18)] transition-all duration-300"
        >
          <Image
            src={t.image}
            alt={t.title}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute left-5 right-5 bottom-5 text-white">
            <i className={`${t.icon} text-lg mb-1.5 opacity-90`} aria-hidden="true" />
            <p className="text-[20px] font-extrabold leading-tight">{t.title}</p>
            <p className="text-[13px] text-white/90 mt-1">{t.desc}</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold mt-2.5">
              Khám phá <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

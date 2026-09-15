"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export const NAV_LINKS = [
  { id: "nav.home", label: "Trang chủ", href: "/", icon: "fa-solid fa-house", exact: true },
  { id: "nav.community", label: "Cộng Đồng Phan Thiết", href: "/nghi-duong", icon: "fa-solid fa-people-group", hot: true },
  { id: "nav.stay", label: "Lưu trú", href: "/luu-tru", icon: "fa-solid fa-bed" },
  { id: "nav.food", label: "Ẩm Thực", href: "/am-thuc", icon: "fa-solid fa-utensils" },
  { id: "nav.game", label: "Game trúng thưởng", href: "/game-trung-thuong", icon: "fa-solid fa-gamepad", hot: true },
  { id: "nav.blog", label: "Blog", href: "/tin-tuc", icon: "fa-solid fa-blog" },
];

// Cac muc menu nam TRUC TIEP tren nen gradient cua header - khong boc trong container
// pill/bo-vien-bo-tron rieng, de header luon la MOT dai nen lien tuc tu trai sang phai.
// Chi muc dang active moi co nen phu nhe (rgba trang mo), giong nhu spec yeu cau.
export default function HeaderNav() {
  const pathname = usePathname();
  const { translate } = useLanguage();

  return (
    <nav className="hidden xl:flex items-center gap-1 2xl:gap-2">
      {NAV_LINKS.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const label = translate(link.id, link.label);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex items-center gap-1.5 h-10 px-3 rounded-[10px] text-[14px] 2xl:text-[15px] font-bold whitespace-nowrap transition-all duration-200 ${
              isActive
                ? "bg-white/15 text-white"
                : "text-white/85 hover:text-white hover:bg-white/8 hover:-translate-y-px"
            }`}
          >
            <i className={`${link.icon} text-[18px]`} aria-hidden="true" />
            {label}
            {link.hot && (
              <span className="animate-badge-bounce absolute -top-1.5 -right-1.5 bg-[#FF4D4F] text-white text-[10px] font-extrabold px-[6px] py-[1px] rounded-[5px] leading-[14px] shadow-sm">
                {translate("common.hot", "HOT")}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { Flame, MapPin, CalendarDays, ArrowUpRight } from "lucide-react";
import type { Sale } from "@prisma/client";

const FALLBACK_SRC = "/images/khuyen-mai.png";

// 1 card duy nhat dung cho ca 3 vi tri (hero/nho/rong) - kich thuoc/chieu cao do
// wrapper ben ngoai (SaleSection) quyet dinh qua className truyen vao, component nay
// chi lo phan trinh bay ben trong (anh, overlay, badge, text, nut mui ten).
export default function PromotionCard({
  sale,
  isFeatured = false,
  priority = false,
  className = "",
}: {
  sale: Sale;
  isFeatured?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const src = broken || !sale.image ? FALLBACK_SRC : sale.image;
  const isHot = typeof sale.discountPercent === "number" && sale.discountPercent > 0;
  const expiry = sale.endDate
    ? new Date(sale.endDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;

  return (
    <a
      href={sale.phone ? `tel:${sale.phone}` : "#"}
      aria-label={`${sale.title} - ${sale.placeName}`}
      className={`group relative block overflow-hidden rounded-[20px] cursor-pointer transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-[3px] ${className}`}
      style={{ boxShadow: "0 8px 30px rgba(6, 42, 77, 0.08)" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 16px 40px rgba(6, 42, 77, 0.14)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 8px 30px rgba(6, 42, 77, 0.08)")}
    >
      <Image
        src={src}
        alt={sale.title}
        fill
        sizes="(min-width: 1280px) 55vw, (min-width: 768px) 50vw, 100vw"
        loading={priority ? "eager" : "lazy"}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        onError={() => setBroken(true)}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(2,20,35,0.95) 0%, rgba(2,20,35,0.70) 30%, rgba(2,20,35,0.15) 65%, rgba(2,20,35,0) 100%)",
        }}
      />

      {isHot && (
        <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-promo-accent text-white text-[13px] font-bold rounded-full px-3 py-[7px] shadow-sm">
          <Flame size={14} strokeWidth={2} aria-hidden="true" />
          {isFeatured ? "Hot nhất" : "Hot"}
        </span>
      )}

      <span className="absolute right-4 bottom-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 border border-white/25 text-white backdrop-blur-[8px] transition-all duration-300 ease-out group-hover:bg-white group-hover:text-promo-oceanPrimary group-hover:translate-x-[2px] group-hover:-translate-y-[2px]">
        <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 pr-16">
        <p
          className={`text-white font-bold drop-shadow-sm line-clamp-2 leading-[1.25] ${
            isFeatured ? "text-[20px] sm:text-[22px] xl:text-2xl" : "text-base sm:text-lg"
          }`}
        >
          {sale.title}
        </p>
        <p className="text-white/85 text-sm mt-1 line-clamp-1">{sale.placeName}</p>
        <div className="flex items-center gap-1.5 text-white/85 text-[13px] mt-2">
          <MapPin size={15} strokeWidth={2} aria-hidden="true" />
          <span>Phan Thiết</span>
          {expiry && (
            <>
              <span aria-hidden="true">•</span>
              <CalendarDays size={15} strokeWidth={2} aria-hidden="true" />
              <span>Đến {expiry}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}

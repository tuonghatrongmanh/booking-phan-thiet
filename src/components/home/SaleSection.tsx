import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";
import PromotionCard from "./PromotionCard";
import type { Sale } from "@prisma/client";

// Gallery chi hien toi da 4 chuong trinh noi bat tren trang chu (dung bo cuc masonry
// bat doi xung theo spec rieng) - xem het danh sach day du qua nut "Xem tat ca".
const MAX_VISIBLE = 4;

// Bo cuc masonry desktop (>=xl) thay doi tuy so luong sale thuc te (1-4) de khong
// de lai khoang trong vo nghia khi du lieu chua du 4 chuong trinh.
function DesktopMasonry({ sales }: { sales: Sale[] }) {
  const [hero, second, third, fourth] = sales;

  if (sales.length === 1) {
    return <PromotionCard sale={hero} isFeatured priority className="w-full h-[450px]" />;
  }

  if (sales.length === 2) {
    return (
      <div className="flex gap-4 items-stretch">
        <PromotionCard sale={hero} isFeatured priority className="w-[52%] h-[450px]" />
        <PromotionCard sale={second} className="w-[48%] h-[450px]" />
      </div>
    );
  }

  if (sales.length === 3) {
    return (
      <div className="flex gap-4 items-stretch">
        <PromotionCard sale={hero} isFeatured priority className="w-[52%] h-[450px]" />
        <div className="w-[48%] flex flex-col gap-4">
          <PromotionCard sale={second} className="h-[217px]" />
          <PromotionCard sale={third} className="h-[217px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-stretch">
      <PromotionCard sale={hero} isFeatured priority className="w-[52%] h-[450px]" />
      <div className="w-[48%] flex flex-col gap-4">
        <div className="flex gap-4 h-[210px]">
          <PromotionCard sale={second} className="flex-1" />
          <PromotionCard sale={third} className="flex-1" />
        </div>
        <PromotionCard sale={fourth} className="h-[220px]" />
      </div>
    </div>
  );
}

export default function SaleSection({ sales }: { sales: Sale[] }) {
  const visibleSales = sales.slice(0, MAX_VISIBLE);

  return (
    <section className="container-custom py-16 lg:py-20">
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-4 mb-7 sm:mb-9">
        <div>
          <h2 className="flex items-center gap-3 font-bold text-[26px] sm:text-[30px] leading-tight text-promo-text">
            <span className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-promo-oceanLight shrink-0">
              <Flame size={20} strokeWidth={2} className="text-promo-oceanPrimary" aria-hidden="true" />
            </span>
            Khuyến mãi hot tại Phan Thiết
          </h2>
          <p className="text-base text-promo-textMuted mt-2">
            Ưu đãi hấp dẫn – Tiết kiệm chi phí cho chuyến đi của bạn
          </p>
        </div>
        <Link
          href="/khuyen-mai"
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-promo-oceanPrimary border border-[#B7DDEC] rounded-full px-5 py-3 hover:bg-promo-oceanLight hover:border-promo-oceanPrimary transition-colors duration-200 shrink-0"
        >
          Xem tất cả
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>

      {visibleSales.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-promo-textMuted">
          Chưa có chương trình sale nào được đăng. Vào trang quản trị để thêm mới.
        </div>
      ) : (
        <>
          {/* Mobile (<md): stack doc. Tablet (md-xl): luoi 2x2 deu nhau. */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:hidden gap-4">
            {visibleSales.map((sale, i) => (
              <PromotionCard
                key={sale.id}
                sale={sale}
                isFeatured={i === 0}
                priority={i === 0}
                className={i === 0 ? "h-[280px] md:h-[220px]" : "h-[220px]"}
              />
            ))}
          </div>

          {/* Desktop (>=xl): masonry bat doi xung 52%/48%. */}
          <div className="hidden xl:block">
            <DesktopMasonry sales={visibleSales} />
          </div>
        </>
      )}
    </section>
  );
}

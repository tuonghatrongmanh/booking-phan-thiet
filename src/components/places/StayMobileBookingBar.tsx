import { formatPriceVnd } from "@/lib/place-amenities";

export default function StayMobileBookingBar({
  priceFromVnd,
  phone,
  zaloUrl,
}: {
  priceFromVnd: number | null;
  phone: string | null;
  zaloUrl: string | null;
}) {
  const ctaHref = zaloUrl || (phone ? `tel:${phone}` : undefined);

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.10)] h-[68px] px-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        {priceFromVnd != null ? (
          <p className="truncate">
            <span className="text-base font-extrabold text-[#1678C8]">{formatPriceVnd(priceFromVnd)}</span>{" "}
            <span className="text-xs text-[#8298AE]">/ đêm</span>
          </p>
        ) : (
          <p className="text-xs text-[#8298AE]">Liên hệ để biết giá</p>
        )}
      </div>
      <a
        href={ctaHref}
        target={zaloUrl ? "_blank" : undefined}
        rel={zaloUrl ? "noopener noreferrer" : undefined}
        aria-disabled={!ctaHref}
        className={`shrink-0 h-11 min-w-[132px] px-5 rounded-xl font-extrabold text-white flex items-center justify-center gap-2 ${
          ctaHref ? "bg-gradient-to-br from-[#168FE2] to-[#0879CE]" : "bg-slate-300 pointer-events-none"
        }`}
      >
        Đặt ngay
      </a>
    </div>
  );
}

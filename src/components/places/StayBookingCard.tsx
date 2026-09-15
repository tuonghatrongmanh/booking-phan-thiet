import { formatPriceVnd } from "@/lib/place-amenities";

export default function StayBookingCard({
  priceFromVnd,
  phone,
  zaloUrl,
}: {
  priceFromVnd: number | null;
  phone: string | null;
  zaloUrl: string | null;
}) {
  const ctaHref = zaloUrl || (phone ? `tel:${phone}` : undefined);
  const ctaLabel = zaloUrl ? "Đặt ngay qua Zalo" : phone ? "Gọi đặt phòng" : "Liên hệ đang cập nhật";

  return (
    <div className="bg-white border border-[#E3ECF4] rounded-[18px] shadow-[0_12px_35px_rgba(16,60,100,0.12)] p-6">
      {priceFromVnd != null ? (
        <>
          <p>
            <span className="text-sm text-[#8298AE]">Giá từ</span>{" "}
            <span className="text-[30px] font-extrabold text-[#1678C8] leading-none">{formatPriceVnd(priceFromVnd)}</span>{" "}
            <span className="text-sm text-[#8298AE]">/ đêm</span>
          </p>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-[#16A05D] mt-1">
            <i className="fa-solid fa-circle-check" aria-hidden="true" /> Giá tốt hôm nay
          </p>
        </>
      ) : (
        <p className="text-sm text-[#8298AE]">Liên hệ để biết giá</p>
      )}

      <form className="mt-4 space-y-2.5">
        <label className="block border border-[#DCE7F1] rounded-[10px] px-3.5 py-2.5 focus-within:border-[#168BE0] focus-within:ring-4 focus-within:ring-[#168BE0]/10 transition">
          <span className="block text-[11px] font-semibold text-[#8298AE]">Nhận phòng</span>
          <div className="flex items-center gap-2 mt-0.5">
            <i className="fa-regular fa-calendar text-[#8298AE] text-sm" aria-hidden="true" />
            <input type="date" name="checkin" className="w-full text-sm text-[#102F4F] focus:outline-none" />
          </div>
        </label>

        <label className="block border border-[#DCE7F1] rounded-[10px] px-3.5 py-2.5 focus-within:border-[#168BE0] focus-within:ring-4 focus-within:ring-[#168BE0]/10 transition">
          <span className="block text-[11px] font-semibold text-[#8298AE]">Trả phòng</span>
          <div className="flex items-center gap-2 mt-0.5">
            <i className="fa-regular fa-calendar text-[#8298AE] text-sm" aria-hidden="true" />
            <input type="date" name="checkout" className="w-full text-sm text-[#102F4F] focus:outline-none" />
          </div>
        </label>

        <label className="block border border-[#DCE7F1] rounded-[10px] px-3.5 py-2.5 focus-within:border-[#168BE0] focus-within:ring-4 focus-within:ring-[#168BE0]/10 transition">
          <span className="block text-[11px] font-semibold text-[#8298AE]">Số khách</span>
          <div className="flex items-center gap-2 mt-0.5">
            <i className="fa-solid fa-user-group text-[#8298AE] text-sm" aria-hidden="true" />
            <select name="guests" defaultValue="2-1" className="w-full text-sm text-[#102F4F] focus:outline-none bg-transparent">
              <option value="1-1">1 khách, 1 phòng</option>
              <option value="2-1">2 khách, 1 phòng</option>
              <option value="3-1">3 khách, 1 phòng</option>
              <option value="4-2">4 khách, 2 phòng</option>
            </select>
          </div>
        </label>
      </form>

      <a
        href={ctaHref}
        target={zaloUrl ? "_blank" : undefined}
        rel={zaloUrl ? "noopener noreferrer" : undefined}
        aria-disabled={!ctaHref}
        className={`mt-4 w-full h-[52px] rounded-xl font-extrabold text-white flex items-center justify-center gap-2 transition ${
          ctaHref
            ? "bg-gradient-to-br from-[#168FE2] to-[#0879CE] shadow-[0_6px_16px_rgba(22,139,224,0.22)] hover:-translate-y-0.5 hover:brightness-105"
            : "bg-slate-300 pointer-events-none"
        }`}
      >
        <i className="fa-solid fa-bolt" aria-hidden="true" /> {ctaLabel}
      </a>

      <div className="mt-4 space-y-2 text-[13px] text-[#486783]">
        <p className="flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-[#16A05D]" aria-hidden="true" /> Không cần thẻ tín dụng
        </p>
        <p className="flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-[#16A05D]" aria-hidden="true" /> Xác nhận nhanh chóng qua điện thoại/Zalo
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPriceVnd } from "@/lib/place-amenities";
import StayBookingModal, { type StayBookingConfig } from "@/components/places/StayBookingModal";

export default function StayBookingCard({
  placeId,
  placeName,
  booking,
  priceFromVnd,
  phone,
  zaloUrl,
}: {
  placeId: string;
  placeName: string;
  booking: StayBookingConfig;
  priceFromVnd: number | null;
  phone: string | null;
  zaloUrl: string | null;
}) {
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("2-1");
  const [open, setOpen] = useState(false);
  const contactHref = zaloUrl || (phone ? `tel:${phone}` : undefined);
  const contactLabel = zaloUrl ? "Nhắn Zalo tư vấn" : "Gọi tư vấn";

  return (
    <div className="bg-white border border-[#E3ECF4] rounded-[18px] shadow-[0_12px_35px_rgba(16,60,100,0.12)] p-6">
      {priceFromVnd != null ? (
        <>
          <p>
            <span className="text-sm text-[#8298AE]">Giá từ</span>{" "}
            <span className="text-[30px] font-extrabold text-brand-blue leading-none">{formatPriceVnd(priceFromVnd)}</span>{" "}
            <span className="text-sm text-[#8298AE]">/ đêm</span>
          </p>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-[#16A05D] mt-1">
            <i className="fa-solid fa-circle-check" aria-hidden="true" /> Giá tốt hôm nay
          </p>
        </>
      ) : (
        <p className="text-sm text-[#8298AE]">Liên hệ để biết giá</p>
      )}

      <form className="mt-4 space-y-2.5" onSubmit={(e) => e.preventDefault()}>
        <label className="block border border-[#DCE7F1] rounded-[10px] px-3.5 py-2.5 focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/10 transition">
          <span className="block text-[11px] font-semibold text-[#8298AE]">Nhận phòng</span>
          <div className="flex items-center gap-2 mt-0.5">
            <i className="fa-regular fa-calendar text-[#8298AE] text-sm" aria-hidden="true" />
            <input type="date" name="checkin" value={checkin} onChange={(e) => setCheckin(e.target.value)} className="w-full text-sm text-[#102F4F] focus:outline-none" />
          </div>
        </label>

        <label className="block border border-[#DCE7F1] rounded-[10px] px-3.5 py-2.5 focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/10 transition">
          <span className="block text-[11px] font-semibold text-[#8298AE]">Trả phòng</span>
          <div className="flex items-center gap-2 mt-0.5">
            <i className="fa-regular fa-calendar text-[#8298AE] text-sm" aria-hidden="true" />
            <input type="date" name="checkout" value={checkout} min={checkin || undefined} onChange={(e) => setCheckout(e.target.value)} className="w-full text-sm text-[#102F4F] focus:outline-none" />
          </div>
        </label>

        <label className="block border border-[#DCE7F1] rounded-[10px] px-3.5 py-2.5 focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/10 transition">
          <span className="block text-[11px] font-semibold text-[#8298AE]">Số khách</span>
          <div className="flex items-center gap-2 mt-0.5">
            <i className="fa-solid fa-user-group text-[#8298AE] text-sm" aria-hidden="true" />
            <select name="guests" value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full text-sm text-[#102F4F] focus:outline-none bg-transparent">
              <option value="1-1">1 khách, 1 phòng</option>
              <option value="2-1">2 khách, 1 phòng</option>
              <option value="3-1">3 khách, 1 phòng</option>
              <option value="4-2">4 khách, 2 phòng</option>
            </select>
          </div>
        </label>
      </form>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 w-full h-[52px] rounded-xl font-extrabold text-white flex items-center justify-center gap-2 transition bg-gradient-to-br from-brand-blueLight to-brand-blue shadow-[0_6px_16px_rgba(0,59,149,0.22)] hover:-translate-y-0.5 hover:brightness-105"
      >
        <i className="fa-solid fa-bolt" aria-hidden="true" /> Đặt phòng
      </button>
      {contactHref && (
        <a
          href={contactHref}
          target={zaloUrl ? "_blank" : undefined}
          rel={zaloUrl ? "noopener noreferrer" : undefined}
          className="mt-2 w-full h-11 rounded-xl font-bold text-brand-blue border border-[#DCE7F1] flex items-center justify-center gap-2 hover:bg-[#F3F8FD] transition"
        >
          <i className={zaloUrl ? "fa-solid fa-comment-dots" : "fa-solid fa-phone"} aria-hidden="true" /> {contactLabel}
        </a>
      )}

      <Link href="/tra-cuu-dat-cho" className="mt-3 block text-center text-[13px] font-semibold text-brand-blue hover:underline">
        Đã đặt trước đó? Tra cứu đơn của bạn
      </Link>

      <div className="mt-4 space-y-2 text-[13px] text-[#486783]">
        <p className="flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-[#16A05D]" aria-hidden="true" /> Không cần thẻ tín dụng, chỉ cọc giữ chỗ qua QR
        </p>
        <p className="flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-[#16A05D]" aria-hidden="true" /> Xác nhận nhanh chóng qua điện thoại/Zalo
        </p>
      </div>

      {open && (
        <StayBookingModal
          placeId={placeId}
          placeName={placeName}
          booking={booking}
          priceFromVnd={priceFromVnd}
          phone={phone}
          initialCheckin={checkin || undefined}
          initialCheckout={checkout || undefined}
          initialGuests={Number(guests.split("-")[0]) || undefined}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { formatPriceVnd } from "@/lib/place-amenities";
import StayBookingModal, { type StayBookingConfig } from "@/components/places/StayBookingModal";

export default function StayMobileBookingBar({
  placeId,
  placeName,
  booking,
  priceFromVnd,
  phone,
}: {
  placeId: string;
  placeName: string;
  booking: StayBookingConfig;
  priceFromVnd: number | null;
  phone: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.10)] h-[68px] px-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        {priceFromVnd != null ? (
          <p className="truncate">
            <span className="text-base font-extrabold text-brand-blue">{formatPriceVnd(priceFromVnd)}</span>{" "}
            <span className="text-xs text-[#8298AE]">/ đêm</span>
          </p>
        ) : (
          <p className="text-xs text-[#8298AE]">Liên hệ để biết giá</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 h-11 min-w-[132px] px-5 rounded-xl font-extrabold text-white flex items-center justify-center gap-2 bg-gradient-to-br from-brand-blueLight to-brand-blue"
      >
        Đặt phòng
      </button>
      {open && (
        <StayBookingModal
          placeId={placeId}
          placeName={placeName}
          booking={booking}
          priceFromVnd={priceFromVnd}
          phone={phone}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

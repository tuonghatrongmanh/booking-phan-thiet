"use client";

import Image from "next/image";
import { AVAILABILITY_INFO, availabilityLabel, type AvailabilityStatusKey } from "@/lib/places";
import type { VehicleData } from "./VehicleListClient";

function formatVnd(n: number | null) {
  if (n == null) return "Liên hệ";
  return `${n.toLocaleString("vi-VN")}đ`;
}

function StarRow({ value }: { value: number }) {
  return (
    <span className="text-[11px] sm:text-[12px] whitespace-nowrap">
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={i < Math.round(value) ? "fa-solid fa-star text-amber-400" : "fa-solid fa-star text-slate-200"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

// Thẻ xe gọn (4 cột x 2 dòng / trang trên máy tính, 2 cột trên điện thoại).
// dateStatus: khi khách đã chọn ngày nhận/trả và bấm "Tìm xe", cho biết xe còn bao nhiêu chiếc trong khoảng đó.
export default function VehicleCard({
  vehicle,
  isFavorite,
  dateStatus,
  onToggleFavorite,
  onQuickView,
  onBook,
}: {
  vehicle: VehicleData;
  isFavorite: boolean;
  dateStatus: { remaining: number } | null;
  onToggleFavorite: () => void;
  onQuickView: () => void;
  onBook: () => void;
}) {
  const baseAvailable = vehicle.availabilityStatus
    ? vehicle.availabilityStatus === "AVAILABLE"
    : vehicle.availableRooms == null || vehicle.availableRooms > 0;
  const soldOutForDates = dateStatus !== null && dateStatus.remaining <= 0;
  const isAvailable = baseAvailable && !soldOutForDates;

  const statusLabel = soldOutForDates
    ? "Hết xe ngày này"
    : vehicle.availabilityStatus
      ? availabilityLabel(vehicle.availabilityStatus as AvailabilityStatusKey, "vehicle")
      : baseAvailable
        ? dateStatus
          ? `Còn ${dateStatus.remaining} xe`
          : "Còn xe"
        : "Hết xe";
  const statusBg = soldOutForDates
    ? "bg-[#F04444]"
    : vehicle.availabilityStatus
      ? AVAILABILITY_INFO[vehicle.availabilityStatus as AvailabilityStatusKey].bg
      : baseAvailable
        ? "bg-[#16A765]"
        : "bg-[#F04444]";

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E4EAF0] overflow-hidden shadow-[0_3px_14px_rgba(16,50,80,0.06)] hover:shadow-[0_10px_26px_rgba(16,50,80,0.12)] hover:-translate-y-[2px] transition-all duration-200 flex flex-col ${
        !isAvailable ? "opacity-[0.85]" : ""
      }`}
    >
      <div className="relative w-full aspect-[16/11] bg-slate-100">
        <button type="button" onClick={onQuickView} aria-label={`Xem chi tiết ${vehicle.name}`} className="absolute inset-0">
          {vehicle.avatar ? (
            <Image src={vehicle.avatar} alt={vehicle.name} fill sizes="(min-width:1280px) 20vw, (min-width:768px) 30vw, 46vw" className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-brand-blue/25 text-3xl">
              <i className="fa-solid fa-motorcycle" aria-hidden="true" />
            </div>
          )}
        </button>

        <span className={`absolute top-2 left-2 text-[10px] sm:text-[11px] font-bold text-white px-2 py-0.5 sm:py-1 rounded-full pointer-events-none ${statusBg}`}>
          {statusLabel}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={isFavorite ? `Bỏ yêu thích ${vehicle.name}` : `Thêm ${vehicle.name} vào yêu thích`}
          aria-pressed={isFavorite}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 hover:bg-white shadow flex items-center justify-center text-slate-500 text-sm hover:scale-105 transition"
        >
          <i className={isFavorite ? "fa-solid fa-heart text-brand-red" : "fa-regular fa-heart"} aria-hidden="true" />
        </button>
        {vehicle.badge && (
          <span className="absolute bottom-2 left-2 text-[10px] sm:text-[11px] font-bold text-brand-blue bg-white/95 px-2 py-0.5 rounded-full shadow-sm pointer-events-none">
            {vehicle.badge}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        {vehicle.vehicleType && (
          <span className="self-start text-[10px] sm:text-[11px] font-bold text-brand-blue bg-brand-sky rounded-full px-2 py-0.5 mb-1.5 truncate max-w-full">
            {vehicle.vehicleType}
          </span>
        )}
        <button type="button" onClick={onQuickView} className="block text-left w-full">
          <p className="font-extrabold text-[14px] sm:text-[15px] text-[#102F50] leading-snug line-clamp-2 min-h-[2.5em]">{vehicle.name}</p>
        </button>

        <div className="flex items-center gap-1 mt-1">
          <StarRow value={vehicle.ratingAverage} />
          <span className="text-[11px] sm:text-[12px] text-slate-400">({vehicle.ratingTotal})</span>
        </div>

        <p className="flex items-center gap-x-2.5 gap-y-0.5 flex-wrap text-[11px] sm:text-[12px] text-[#6C8195] mt-1.5 min-h-[1.25rem]">
          {vehicle.engineCc != null && <span>{vehicle.engineCc}cc</span>}
          {vehicle.transmission && <span className="truncate">{vehicle.transmission}</span>}
          {vehicle.seats != null && <span>{vehicle.seats} người</span>}
        </p>

        <div className="mt-auto pt-2.5 border-t border-[#EDF1F5]">
          <p className="mb-2">
            <span className="font-extrabold text-[16px] sm:text-[18px] text-brand-blue">{formatVnd(vehicle.priceFromVnd)}</span>
            {vehicle.priceFromVnd != null && <span className="text-[11px] sm:text-[12px] text-[#8293A5]"> /ngày</span>}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onQuickView}
              aria-label={`Xem chi tiết ${vehicle.name}`}
              title="Xem chi tiết"
              className="shrink-0 w-10 h-10 flex items-center justify-center border border-[#D7E4F0] hover:bg-brand-tint transition text-[#33475B] rounded-xl"
            >
              <i className="fa-regular fa-eye" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onBook}
              disabled={!isAvailable}
              className="flex-1 min-w-0 flex items-center justify-center gap-1.5 bg-brand-blue hover:brightness-110 transition text-white font-bold text-[12px] sm:text-[13px] h-10 px-2 rounded-xl disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <i className="fa-regular fa-calendar-check" aria-hidden="true" />
              <span className="truncate">{isAvailable ? "Đặt thuê" : "Hết xe"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

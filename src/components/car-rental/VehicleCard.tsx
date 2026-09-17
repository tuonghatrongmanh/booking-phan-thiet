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
    <span className="text-[13px]">
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

export default function VehicleCard({
  vehicle,
  isFavorite,
  onToggleFavorite,
  onQuickView,
  onBook,
}: {
  vehicle: VehicleData;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onQuickView: () => void;
  onBook: () => void;
}) {
  const isAvailable = vehicle.availabilityStatus
    ? vehicle.availabilityStatus === "AVAILABLE"
    : vehicle.availableRooms == null || vehicle.availableRooms > 0;

  return (
    <div
      className={`bg-white rounded-[18px] border border-[#E4EAF0] overflow-hidden shadow-[0_4px_18px_rgba(16,50,80,0.06)] hover:shadow-[0_10px_28px_rgba(16,50,80,0.12)] hover:-translate-y-[3px] transition-all duration-200 ${
        !isAvailable ? "opacity-[0.85]" : ""
      }`}
    >
      <div className="relative w-full aspect-[4/3] bg-slate-100">
        <button type="button" onClick={onQuickView} aria-label={`Xem chi tiết ${vehicle.name}`} className="absolute inset-0">
          {vehicle.avatar ? (
            <Image src={vehicle.avatar} alt={vehicle.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-brand-blue/25 text-4xl">
              <i className="fa-solid fa-motorcycle" aria-hidden="true" />
            </div>
          )}
        </button>

        <span
          className={`absolute top-2.5 left-2.5 text-[11px] font-bold text-white px-2.5 py-1 rounded-full pointer-events-none ${
            vehicle.availabilityStatus ? AVAILABILITY_INFO[vehicle.availabilityStatus as AvailabilityStatusKey].bg : isAvailable ? "bg-[#16A765]" : "bg-[#F04444]"
          }`}
        >
          {vehicle.availabilityStatus ? availabilityLabel(vehicle.availabilityStatus as AvailabilityStatusKey, "vehicle") : isAvailable ? "Còn xe" : "Hết xe"}
        </span>
        {vehicle.badge && (
          <span className="absolute top-2.5 right-11 text-[11px] font-bold text-brand-blue bg-white/95 px-2.5 py-1 rounded-full shadow-sm pointer-events-none">
            {vehicle.badge}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={isFavorite ? `Bỏ yêu thích ${vehicle.name}` : `Thêm ${vehicle.name} vào yêu thích`}
          aria-pressed={isFavorite}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/95 hover:bg-white shadow flex items-center justify-center text-slate-500 hover:scale-105 transition"
        >
          <i className={isFavorite ? "fa-solid fa-heart text-brand-red" : "fa-regular fa-heart"} aria-hidden="true" />
        </button>
      </div>

      <div className="p-4">
        {vehicle.vehicleType && (
          <span className="inline-block text-[11px] font-bold text-[#1689E8] bg-[#EDF7FF] rounded-full px-2.5 py-1 mb-2">
            {vehicle.vehicleType}
          </span>
        )}
        <button type="button" onClick={onQuickView} className="block text-left w-full">
          <p className="font-extrabold text-[18px] text-[#102F50] leading-snug line-clamp-1">{vehicle.name}</p>
        </button>

        <div className="flex items-center gap-1.5 mt-1.5">
          <StarRow value={vehicle.ratingAverage} />
          <span className="text-[13px] text-slate-400">({vehicle.ratingTotal})</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-[13px] text-[#6C8195] mt-2.5">
          {vehicle.engineCc != null && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-gauge-high" aria-hidden="true" /> {vehicle.engineCc}cc
            </span>
          )}
          {vehicle.transmission && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-gears" aria-hidden="true" /> {vehicle.transmission}
            </span>
          )}
          {vehicle.seats != null && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-user-group" aria-hidden="true" /> {vehicle.seats} người
            </span>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-[#EDF1F5]">
          <p className="mb-2.5">
            <span className="font-extrabold text-[20px] text-[#087FD8]">{formatVnd(vehicle.priceFromVnd)}</span>
            {vehicle.priceFromVnd != null && <span className="text-[13px] text-[#8293A5]"> /ngày</span>}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onQuickView}
              className="flex-1 flex items-center justify-center gap-1.5 border border-[#D7E4F0] hover:bg-[#F4F9FE] transition text-[#33475B] font-bold text-[13px] h-[42px] px-3 rounded-xl"
            >
              <i className="fa-regular fa-eye" aria-hidden="true" />
              Xem chi tiết
            </button>
            <button
              type="button"
              onClick={onBook}
              disabled={!isAvailable}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#1689E8] hover:bg-[#087FD8] transition text-white font-bold text-[13px] h-[42px] px-3 rounded-xl disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <i className="fa-regular fa-calendar-check" aria-hidden="true" />
              {isAvailable ? "Đặt thuê" : "Đã hết xe"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

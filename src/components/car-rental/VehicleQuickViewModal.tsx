"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { VehicleData } from "./VehicleListClient";

function formatVnd(n: number | null) {
  if (n == null) return "Liên hệ";
  return `${n.toLocaleString("vi-VN")}đ`;
}

export default function VehicleQuickViewModal({ vehicle, onClose }: { vehicle: VehicleData; onClose: () => void }) {
  const allImages = [...(vehicle.avatar ? [vehicle.avatar] : []), ...vehicle.images.map((i) => i.url)];
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const pickupLocation = vehicle.address || "Liên hệ để biết địa điểm";
  const returnLocation = vehicle.returnLocation || pickupLocation;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between shrink-0">
          <h2 className="font-display font-bold text-lg text-slate-800 line-clamp-1">{vehicle.name}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col sm:flex-row">
          <div className="w-full sm:w-[42%] shrink-0 p-4 sm:p-5 sm:border-r border-slate-100 flex flex-col overflow-y-auto">
            <div className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2 shrink-0">
              {allImages[activeImg] ? (
                <Image src={allImages[activeImg]} alt="" fill sizes="(max-width: 640px) 100vw, 42vw" className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-brand-blue/25 text-4xl">
                  <i className="fa-solid fa-motorcycle" aria-hidden="true" />
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="mb-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Hình ảnh xe</p>
                <div className="grid grid-cols-4 gap-2">
                  {allImages.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      className={`relative aspect-square rounded-lg overflow-hidden bg-slate-100 ${
                        i === activeImg ? "ring-2 ring-brand-blue" : ""
                      }`}
                    >
                      <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-1.5 mt-3 shrink-0">
              <div className="flex flex-col items-center text-center gap-1 bg-brand-sky/40 rounded-lg py-2 px-1">
                <i className="fa-solid fa-shield-halved text-brand-blue text-sm" aria-hidden="true" />
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">Đã xác minh giấy tờ</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 bg-brand-sky/40 rounded-lg py-2 px-1">
                <i className="fa-solid fa-clock text-brand-blue text-sm" aria-hidden="true" />
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">Giao xe đúng giờ</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 bg-brand-sky/40 rounded-lg py-2 px-1">
                <i className="fa-solid fa-headset text-brand-blue text-sm" aria-hidden="true" />
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">Hỗ trợ 24/7</span>
              </div>
            </div>

            {vehicle.phone && (
              <a
                href={`tel:${vehicle.phone}`}
                className="mt-3 block text-center bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-full py-2.5 shrink-0"
              >
                <i className="fa-solid fa-phone mr-2" aria-hidden="true" /> Liên hệ {vehicle.phone}
              </a>
            )}
          </div>

          <div className="flex-1 min-h-0 p-4 sm:p-5 space-y-4 overflow-y-auto">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-brand-sky/40 rounded-xl p-3">
                <p className="text-[11px] text-slate-500 font-semibold">Giá ngày thường</p>
                <p className="font-display font-extrabold text-brand-blue text-lg">{formatVnd(vehicle.priceFromVnd)}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-[11px] text-slate-500 font-semibold">Giá ngày lễ / cuối tuần</p>
                <p className="font-display font-extrabold text-amber-600 text-lg">{formatVnd(vehicle.priceHolidayVnd)}</p>
              </div>
            </div>

            {vehicle.description && (
              <div>
                <p className="font-bold text-sm text-slate-800 mb-1.5">Mô tả</p>
                <p className="text-sm text-slate-600 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {vehicle.amenities.length > 0 && (
              <div>
                <p className="font-bold text-sm text-slate-800 mb-1.5">Tiện ích kèm theo</p>
                <div className="flex flex-wrap gap-1.5">
                  {vehicle.amenities.map((a) => (
                    <span key={a} className="text-xs font-semibold text-brand-blue bg-brand-sky/50 rounded-full px-2.5 py-1">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {vehicle.openingHours && (
              <div>
                <p className="font-bold text-sm text-slate-800 mb-1.5">Quy định check-in / check-out</p>
                <p className="text-sm text-slate-600 whitespace-pre-line">{vehicle.openingHours}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-sm text-slate-800 mb-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-location-dot text-brand-blue" aria-hidden="true" /> Nhận xe tại
                </p>
                <p className="text-sm text-slate-600">{pickupLocation}</p>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800 mb-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-location-dot text-brand-blue" aria-hidden="true" /> Trả xe tại
                </p>
                <p className="text-sm text-slate-600">{returnLocation}</p>
              </div>
            </div>

            {vehicle.mapEmbedUrl && (
              <div>
                <p className="font-bold text-sm text-slate-800 mb-1.5">Bản đồ</p>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                  <iframe src={vehicle.mapEmbedUrl} className="absolute inset-0 w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

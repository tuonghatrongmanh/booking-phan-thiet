"use client";

import { useState } from "react";
import Image from "next/image";
import VehicleQuickViewModal from "./VehicleQuickViewModal";
import { AVAILABILITY_INFO, availabilityLabel, type AvailabilityStatusKey } from "@/lib/places";

export type VehicleData = {
  id: string;
  name: string;
  avatar: string | null;
  vehicleType: string | null;
  priceFromVnd: number | null;
  priceHolidayVnd: number | null;
  availableRooms: number | null;
  totalRooms: number | null;
  availabilityStatus: AvailabilityStatusKey | null;
  createdAt: string;
  ratingAverage: number;
  ratingTotal: number;
  description: string | null;
  amenities: string[];
  openingHours: string | null;
  address: string | null;
  returnLocation: string | null;
  phone: string | null;
  mapEmbedUrl: string | null;
  images: { url: string }[];
};

function formatVnd(n: number | null) {
  if (n == null) return "Liên hệ";
  return `${n.toLocaleString("vi-VN")}đ`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

function StarRow({ value }: { value: number }) {
  return (
    <span className="text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={i < Math.round(value) ? "fa-solid fa-star text-brand-gold" : "fa-solid fa-star text-slate-200"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function VehicleListClient({ vehicles }: { vehicles: VehicleData[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = vehicles.find((v) => v.id === activeId) ?? null;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Tất cả");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const categories = ["Tất cả", ...Array.from(new Set(vehicles.map((v) => v.vehicleType).filter((t): t is string => Boolean(t))))];

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = vehicles.filter((v) => {
    const matchesCategory = category === "Tất cả" || v.vehicleType === category;
    const matchesSearch =
      !normalizedSearch ||
      v.name.toLowerCase().includes(normalizedSearch) ||
      (v.vehicleType ?? "").toLowerCase().includes(normalizedSearch) ||
      (v.address ?? "").toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(1);
  }

  return (
    <>
      <div className="mb-6 space-y-3.5">
        <div className="relative max-w-xl">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm theo tên xe, loại xe, khu vực..."
            className="w-full border border-slate-200 rounded-full pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleCategoryChange(c)}
              className={`text-xs font-bold px-3.5 py-2 rounded-full transition ${
                category === c ? "bg-brand-blue text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-slate-400">Tìm thấy {filtered.length} xe</p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-400">
          <i className="fa-solid fa-magnifying-glass text-3xl mb-3 text-slate-300" aria-hidden="true" />
          <p>Không tìm thấy xe phù hợp. Thử từ khóa hoặc bộ lọc khác nhé.</p>
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {pageItems.map((v) => {
          const hasStock = v.availableRooms == null || v.availableRooms > 0;
          return (
            <div key={v.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="relative aspect-4/3 bg-slate-100">
                {v.avatar ? (
                  <Image src={v.avatar} alt={v.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-brand-blue/25 text-3xl">
                    <i className="fa-solid fa-motorcycle" aria-hidden="true" />
                  </div>
                )}
                <span
                  className={`absolute top-2.5 left-2.5 text-[11px] font-bold text-white px-2.5 py-1 rounded-full ${
                    v.availabilityStatus ? AVAILABILITY_INFO[v.availabilityStatus].bg : hasStock ? "bg-brand-green" : "bg-brand-red"
                  }`}
                >
                  {v.availabilityStatus ? availabilityLabel(v.availabilityStatus, "vehicle") : hasStock ? "Còn xe" : "Hết xe"}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveId(v.id)}
                  aria-label={`Xem chi tiết ${v.name}`}
                  className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-white/95 hover:bg-white hover:scale-105 transition flex items-center justify-center text-slate-700 shadow"
                >
                  <i className="fa-solid fa-eye" aria-hidden="true" />
                </button>
              </div>
              <div className="p-3.5">
                {v.vehicleType && (
                  <span className="inline-block text-[10px] font-bold text-brand-blue bg-brand-sky/60 rounded-full px-2 py-0.5 mb-1.5">
                    {v.vehicleType}
                  </span>
                )}
                <p className="font-bold text-sm text-slate-800 line-clamp-1">{v.name}</p>
                <div className="flex items-center gap-1 text-xs mt-1.5">
                  <StarRow value={v.ratingAverage} />
                  <span className="text-slate-400">({v.ratingTotal})</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Đăng {formatDate(v.createdAt)}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <p>
                    <span className="font-display font-extrabold text-brand-blue text-[15px]">{formatVnd(v.priceFromVnd)}</span>
                    <span className="text-[11px] text-slate-400"> /ngày</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveId(v.id)}
                    className="text-[11px] font-bold text-brand-blue hover:underline"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1.5 mt-6" aria-label="Phân trang">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Trang trước"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                p === currentPage ? "bg-brand-blue text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Trang sau"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
          </button>
        </nav>
      )}


      {active && <VehicleQuickViewModal vehicle={active} onClose={() => setActiveId(null)} />}
    </>
  );
}

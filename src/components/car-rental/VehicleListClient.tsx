"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import VehicleCard from "./VehicleCard";
import VehicleQuickViewModal from "./VehicleQuickViewModal";
import VehicleBookingModal from "./VehicleBookingModal";
import type { AvailabilityStatusKey } from "@/lib/places";
import { normalizeText, remainingUnits } from "@/lib/vehicle-search";

export type VehicleData = {
  id: string;
  name: string;
  avatar: string | null;
  vehicleType: string | null;
  brand: string | null;
  engineCc: number | null;
  transmission: string | null;
  seats: number | null;
  badge: string | null;
  priceFromVnd: number | null;
  priceHolidayVnd: number | null;
  availableRooms: number | null;
  totalRooms: number | null;
  depositVnd: number; // tiền cọc giữ chỗ MỖI xe (đã gộp mặc định trong Cài đặt)
  depositEnabled: boolean; // admin đã cấu hình tài khoản nhận cọc chưa
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
  // Các đợt xe đã được khách ĐẶT CỌC xong (chỉ ngày + số lượng, không có thông tin khách) - dùng để lọc theo ngày
  bookedRanges: { from: string; to: string; qty: number }[];
};


const FAVORITES_KEY = "bookingphanthiet_favorite_vehicles";

import { pageNumbers } from "@/lib/pagination";
import { useMediaQuery } from "@/lib/use-media-query";

function formatShort(dateStr: string) {
  const [, m, d] = dateStr.split("-");
  return d + "/" + m;
}

const AREA_OPTIONS = ["Tất cả khu vực", "Phan Thiết", "Mũi Né", "Hàm Tiến", "Hưng Long", "Tiến Thành", "Phú Hài"];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "popular", label: "Phổ biến nhất" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "newest", label: "Xe mới nhất" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function readFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export default function VehicleListClient({ vehicles }: { vehicles: VehicleData[] }) {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState(AREA_OPTIONS[0]);
  const [pickupDate, setPickupDate] = useState(todayStr());
  const [returnDate, setReturnDate] = useState(todayStr());
  // Ngày đã "áp dụng" khi bấm Tìm xe: từ đó thẻ xe hiện đúng số xe còn trống trong khoảng ngày này
  const [appliedDates, setAppliedDates] = useState<{ from: string; to: string } | null>(null);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const [dateError, setDateError] = useState<string | null>(null);
  // Điện thoại: 4 xe/trang (2 cột x 2 dòng) - có hơn 4 xe là phân trang; máy tính: 4 cột x 2 dòng
  const isMobile = useMediaQuery("(max-width: 639px)");
  const PAGE_SIZE = isMobile ? 4 : 8;

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    // Đọc yêu thích từ localStorage sau khi hydrate (hoãn 1 tick để không setState đồng bộ trong effect)
    const t = setTimeout(() => setFavorites(new Set(readFavorites())), 0);
    return () => clearTimeout(t);
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // localStorage không khả dụng (chế độ ẩn danh...) - bỏ qua, không làm vỡ tính năng chính
      }
      return next;
    });
  }

  const vehicleTypes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.vehicleType).filter((t): t is string => Boolean(t)))),
    [vehicles]
  );
  const brands = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.brand).filter((t): t is string => Boolean(t)))),
    [vehicles]
  );
  const transmissions = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.transmission).filter((t): t is string => Boolean(t)))),
    [vehicles]
  );
  const priceCeiling = useMemo(() => {
    const prices = vehicles.map((v) => v.priceFromVnd).filter((p): p is number => p != null);
    return prices.length ? Math.max(...prices) : 0;
  }, [vehicles]);

  function toggleInArray(arr: string[], value: string, setter: (v: string[]) => void) {
    setter(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
  }

  function resetFilters() {
    setSelectedTypes([]);
    setSelectedBrands([]);
    setSelectedTransmissions([]);
    setAppliedDates(null);
    setOnlyAvailable(false);
    setMaxPrice(null);
    setArea(AREA_OPTIONS[0]);
    setSearch("");
    setPage(1);
  }

  // Tìm kiếm toàn diện: bỏ dấu, tách thành nhiều từ (khớp đủ TẤT CẢ các từ), tìm trong tên, loại, hãng, dung tích,
  // hộp số, khu vực, mô tả, tiện ích, nhãn... - vd "xe ga honda mui ne 150cc" hay "so 110".
  const searchIndex = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of vehicles) {
      map.set(
        v.id,
        normalizeText(
          [
            v.name,
            v.vehicleType,
            v.brand,
            v.engineCc != null ? v.engineCc + "cc " + v.engineCc : null,
            v.transmission,
            v.seats != null ? v.seats + " nguoi" : null,
            v.badge,
            v.address,
            v.returnLocation,
            v.description,
            v.amenities.join(" "),
            v.priceFromVnd != null ? String(v.priceFromVnd) : null,
          ]
            .filter(Boolean)
            .join(" ")
        )
      );
    }
    return map;
  }, [vehicles]);

  const searchTokens = useMemo(() => normalizeText(search).split(/\s+/).filter(Boolean), [search]);
  const normalizedArea = normalizeText(area);

  const dateStatusOf = (v: VehicleData): { remaining: number } | null =>
    appliedDates ? { remaining: remainingUnits(v, appliedDates.from, appliedDates.to) } : null;

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const baseAvailable = v.availabilityStatus ? v.availabilityStatus === "AVAILABLE" : v.availableRooms == null || v.availableRooms > 0;
      const forDates = appliedDates ? remainingUnits(v, appliedDates.from, appliedDates.to) > 0 : true;
      const isAvailable = baseAvailable && forDates;

      const haystack = searchIndex.get(v.id) ?? "";
      const matchesSearch = searchTokens.every((t) => haystack.includes(t));
      const matchesArea = area === AREA_OPTIONS[0] || normalizeText(v.address ?? "").includes(normalizedArea);
      const matchesType = selectedTypes.length === 0 || (v.vehicleType != null && selectedTypes.includes(v.vehicleType));
      const matchesBrand = selectedBrands.length === 0 || (v.brand != null && selectedBrands.includes(v.brand));
      const matchesTransmission = selectedTransmissions.length === 0 || (v.transmission != null && selectedTransmissions.includes(v.transmission));
      const matchesPrice = maxPrice == null || v.priceFromVnd == null || v.priceFromVnd <= maxPrice;
      // Đã chọn ngày thì luôn ẩn xe hết trong khoảng đó; nếu không thì chỉ ẩn khi tick "Chỉ hiện xe còn"
      const matchesAvailability = appliedDates ? forDates && (!onlyAvailable || isAvailable) : !onlyAvailable || isAvailable;

      return matchesSearch && matchesArea && matchesType && matchesBrand && matchesTransmission && matchesPrice && matchesAvailability;
    });
  }, [vehicles, searchIndex, searchTokens, area, normalizedArea, selectedTypes, selectedBrands, selectedTransmissions, maxPrice, onlyAvailable, appliedDates]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => (a.priceFromVnd ?? Infinity) - (b.priceFromVnd ?? Infinity));
      case "price-desc":
        return list.sort((a, b) => (b.priceFromVnd ?? -Infinity) - (a.priceFromVnd ?? -Infinity));
      case "rating":
        return list.sort((a, b) => b.ratingAverage - a.ratingAverage || b.ratingTotal - a.ratingTotal);
      case "newest":
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return list.sort((a, b) => b.ratingTotal - a.ratingTotal || b.ratingAverage - a.ratingAverage);
    }
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const quickViewVehicle = vehicles.find((v) => v.id === quickViewId) ?? null;
  const bookingVehicle = vehicles.find((v) => v.id === bookingId) ?? null;

  function handleFilterChange() {
    setPage(1);
  }

  function scrollToList() {
    document.getElementById("danh-sach-xe")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Bấm "Tìm xe" (hoặc Enter): áp dụng ngày nhận/trả để biết xe nào còn trống trong khoảng đó
  function applySearch() {
    if (returnDate < pickupDate) {
      setDateError("Ngày trả xe không được trước ngày nhận xe");
      return;
    }
    setDateError(null);
    setAppliedDates({ from: pickupDate, to: returnDate });
    setPage(1);
    scrollToList();
  }

  function goToPage(p: number) {
    setPage(p);
    scrollToList();
  }

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <p className="font-bold text-sm text-slate-700 mb-2.5">Loại xe</p>
        <div className="space-y-2">
          {vehicleTypes.map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(t)}
                onChange={() => {
                  toggleInArray(selectedTypes, t, setSelectedTypes);
                  handleFilterChange();
                }}
                className="w-4 h-4 rounded accent-brand-blue"
              />
              {t}
            </label>
          ))}
          {vehicleTypes.length === 0 && <p className="text-xs text-slate-400">Chưa có dữ liệu</p>}
        </div>
      </div>

      {priceCeiling > 0 && (
        <div>
          <p className="font-bold text-sm text-slate-700 mb-2.5">Mức giá tối đa</p>
          <input
            type="range"
            min={0}
            max={priceCeiling}
            step={10000}
            value={maxPrice ?? priceCeiling}
            onChange={(e) => {
              setMaxPrice(Number(e.target.value));
              handleFilterChange();
            }}
            className="w-full accent-brand-blue"
          />
          <p className="text-xs text-slate-500 mt-1">
            Dưới {(maxPrice ?? priceCeiling).toLocaleString("vi-VN")}đ / ngày
          </p>
        </div>
      )}

      {brands.length > 0 && (
        <div>
          <p className="font-bold text-sm text-slate-700 mb-2.5">Thương hiệu</p>
          <div className="space-y-2">
            {brands.map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b)}
                  onChange={() => {
                    toggleInArray(selectedBrands, b, setSelectedBrands);
                    handleFilterChange();
                  }}
                  className="w-4 h-4 rounded accent-brand-blue"
                />
                {b}
              </label>
            ))}
          </div>
        </div>
      )}

      {transmissions.length > 0 && (
        <div>
          <p className="font-bold text-sm text-slate-700 mb-2.5">Hộp số</p>
          <div className="space-y-2">
            {transmissions.map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTransmissions.includes(t)}
                  onChange={() => {
                    toggleInArray(selectedTransmissions, t, setSelectedTransmissions);
                    handleFilterChange();
                  }}
                  className="w-4 h-4 rounded accent-brand-blue"
                />
                {t}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="font-bold text-sm text-slate-700 mb-2.5">Trạng thái</p>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => {
              setOnlyAvailable(e.target.checked);
              handleFilterChange();
            }}
            className="w-4 h-4 rounded accent-brand-blue"
          />
          Chỉ hiện xe còn
        </label>
      </div>

      <button
        type="button"
        onClick={resetFilters}
        className="w-full text-sm font-bold text-brand-blue border border-brand-blue/30 rounded-xl py-2.5 hover:bg-brand-sky/30 transition"
      >
        Đặt lại bộ lọc
      </button>
    </div>
  );


  return (
    <>
      <div className="container-custom">
        <div className="relative z-10 -mt-[110px] sm:-mt-[60px] bg-white rounded-[20px] shadow-[0_20px_50px_-18px_rgba(2,60,120,0.28)] p-4 sm:p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              applySearch();
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto] gap-3"
          >
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handleFilterChange();
                }}
                placeholder="Tìm xe: tên, hãng, loại, 110cc, tay ga, khu vực..."
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>

            <select
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                handleFilterChange();
              }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            >
              {AREA_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={pickupDate}
                min={todayStr()}
                onChange={(e) => setPickupDate(e.target.value)}
                aria-label="Ngày nhận xe"
                className="w-full border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
              <input
                type="date"
                value={returnDate}
                min={pickupDate}
                onChange={(e) => setReturnDate(e.target.value)}
                aria-label="Ngày trả xe"
                className="w-full border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>

            <button
              type="submit"
              className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              Tìm xe
            </button>
          </form>
          {dateError && <p className="text-xs text-brand-red mt-2">{dateError}</p>}
        </div>
      </div>

      <div id="danh-sach-xe" className="container-custom pt-6 sm:pt-8 pb-8 sm:pb-10 scroll-mt-24">
        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-sm text-slate-500">
            Tìm thấy <span className="font-bold text-slate-700">{sorted.length}</span> xe
            {appliedDates && (
              <>
                {" "}
                trống {formatShort(appliedDates.from)}
                {appliedDates.to !== appliedDates.from ? " - " + formatShort(appliedDates.to) : ""}
                <button type="button" onClick={() => { setAppliedDates(null); setPage(1); }} className="ml-2 text-brand-blue font-semibold hover:underline">
                  Bỏ lọc ngày
                </button>
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl px-3.5 py-2"
            >
              <i className="fa-solid fa-sliders" aria-hidden="true" />
              Bộ lọc
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-6">
          <aside className="hidden lg:block bg-white rounded-2xl shadow-card p-5 h-fit lg:sticky lg:top-[110px]">{filterPanel}</aside>

          <div>
            {(searchTokens.length > 0 || selectedTypes.length + selectedBrands.length + selectedTransmissions.length > 0 || area !== AREA_OPTIONS[0] || onlyAvailable || maxPrice != null) && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {searchTokens.length > 0 && (
                  <button type="button" onClick={() => { setSearch(""); setPage(1); }} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-sky text-brand-blue rounded-full px-3 py-1.5">
                    &quot;{search.trim()}&quot; <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                )}
                {area !== AREA_OPTIONS[0] && (
                  <button type="button" onClick={() => { setArea(AREA_OPTIONS[0]); setPage(1); }} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-sky text-brand-blue rounded-full px-3 py-1.5">
                    {area} <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                )}
                {selectedTypes.map((t) => (
                  <button key={"t" + t} type="button" onClick={() => { toggleInArray(selectedTypes, t, setSelectedTypes); setPage(1); }} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-sky text-brand-blue rounded-full px-3 py-1.5">
                    {t} <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                ))}
                {selectedBrands.map((b) => (
                  <button key={"b" + b} type="button" onClick={() => { toggleInArray(selectedBrands, b, setSelectedBrands); setPage(1); }} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-sky text-brand-blue rounded-full px-3 py-1.5">
                    {b} <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                ))}
                {selectedTransmissions.map((t) => (
                  <button key={"m" + t} type="button" onClick={() => { toggleInArray(selectedTransmissions, t, setSelectedTransmissions); setPage(1); }} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-sky text-brand-blue rounded-full px-3 py-1.5">
                    {t} <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                ))}
                {maxPrice != null && (
                  <button type="button" onClick={() => { setMaxPrice(null); setPage(1); }} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-sky text-brand-blue rounded-full px-3 py-1.5">
                    Dưới {maxPrice.toLocaleString("vi-VN")}đ <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                )}
                {onlyAvailable && (
                  <button type="button" onClick={() => { setOnlyAvailable(false); setPage(1); }} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-sky text-brand-blue rounded-full px-3 py-1.5">
                    Chỉ xe còn <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                )}
                <button type="button" onClick={resetFilters} className="text-xs font-bold text-slate-500 hover:text-brand-red underline ml-1">
                  Xóa tất cả
                </button>
              </div>
            )}

            {sorted.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-400">
                <i className="fa-solid fa-magnifying-glass text-3xl mb-3 text-slate-300" aria-hidden="true" />
                <p>Không tìm thấy xe phù hợp. Thử từ khóa hoặc bộ lọc khác nhé.</p>
                <button type="button" onClick={resetFilters} className="mt-4 text-sm font-bold text-brand-blue hover:underline">
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {pageItems.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    isFavorite={favorites.has(v.id)}
                    dateStatus={dateStatusOf(v)}
                    onToggleFavorite={() => toggleFavorite(v.id)}
                    onQuickView={() => setQuickViewId(v.id)}
                    onBook={() => setBookingId(v.id)}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-1.5 mt-8 flex-wrap" aria-label="Phân trang">
                <button
                  type="button"
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40 disabled:pointer-events-none"
                >
                  <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
                </button>
                {pageNumbers(currentPage, totalPages).map((p, i) =>
                  p === "gap" ? (
                    <span key={"gap" + i} className="w-7 text-center text-slate-400">…</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goToPage(p)}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                        p === currentPage ? "bg-brand-blue text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Trang sau"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40 disabled:pointer-events-none"
                >
                  <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
                </button>
                <span className="w-full text-center text-xs text-slate-400 mt-1">
                  Trang {currentPage} / {totalPages} - hiển thị {pageItems.length} trên {sorted.length} xe
                </span>
              </nav>
            )}
          </div>
        </div>
      </div>

      {mobileFilterOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[200] lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85dvh] overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-bold text-lg text-slate-800">Bộ lọc</p>
                <button type="button" onClick={() => setMobileFilterOpen(false)} aria-label="Đóng" className="text-slate-400 hover:text-slate-600">
                  <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
                </button>
              </div>
              {filterPanel}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-brand-blue text-white font-bold rounded-xl py-3 mt-5"
              >
                Xem {sorted.length} kết quả
              </button>
            </div>
          </div>,
          document.body
        )}

      {quickViewVehicle && <VehicleQuickViewModal vehicle={quickViewVehicle} onClose={() => setQuickViewId(null)} />}
      {bookingVehicle && (
        <VehicleBookingModal
          vehicle={bookingVehicle}
          initialPickup={appliedDates?.from}
          initialReturn={appliedDates?.to}
          onClose={() => setBookingId(null)}
        />
      )}
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { VehicleData } from "./VehicleListClient";
import DepositQrPanel, { type DepositInfo } from "@/components/booking/DepositQrPanel";
import RememberedOrderBanner from "@/components/booking/RememberedOrderBanner";
import { clearDraft, loadContact, loadDraft, rememberOrder, saveContact, saveDraft, type Draft } from "@/lib/booking-device";

function draftStr(d: Draft, key: string): string {
  const v = d[key];
  return typeof v === "string" ? v : "";
}

function draftNum(d: Draft, key: string, fallback: number): number {
  const v = d[key];
  return typeof v === "number" ? v : fallback;
}

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysStr(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export default function VehicleBookingModal({ vehicle, onClose }: { vehicle: VehicleData; onClose: () => void }) {
  // Khôi phục thông tin khách đã nhập lần trước (liên hệ dùng chung + nháp riêng của xe này)
  // để lỡ thoát form rồi mở lại không phải nhập lại từ đầu.
  const [saved] = useState(() => ({ contact: loadContact(), draft: loadDraft("rental", vehicle.id) }));
  const draftPickup = draftStr(saved.draft, "pickupDate");
  const startDate = draftPickup && draftPickup >= todayStr() ? draftPickup : todayStr();
  const draftReturn = draftStr(saved.draft, "returnDate");
  const [pickupDate, setPickupDate] = useState(startDate);
  const [returnDate, setReturnDate] = useState(draftReturn && draftReturn >= startDate ? draftReturn : addDaysStr(startDate, 1));
  const [pickupLocation, setPickupLocation] = useState(draftStr(saved.draft, "pickupLocation") || (vehicle.address ?? ""));
  const [name, setName] = useState(saved.contact.name);
  const [phone, setPhone] = useState(saved.contact.phone);
  const [email, setEmail] = useState(saved.contact.email);
  const [quantity, setQuantity] = useState(Math.min(Math.max(1, vehicle.totalRooms ?? 1), Math.max(1, draftNum(saved.draft, "quantity", 1))));
  const [note, setNote] = useState(draftStr(saved.draft, "note"));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [deposit, setDeposit] = useState<DepositInfo | null>(null);

  // Tự lưu nháp mỗi khi khách sửa (sau khi đặt xong thì thôi, tránh lưu lại đơn đã gửi)
  useEffect(() => {
    if (done) return;
    saveContact({ name, phone, email });
    saveDraft("rental", vehicle.id, { pickupDate, returnDate, pickupLocation, quantity, note });
  }, [done, name, phone, email, pickupDate, returnDate, pickupLocation, quantity, note, vehicle.id]);

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

  const days = Math.max(1, diffDays(pickupDate, returnDate) || 1);
  const stock = Math.max(1, vehicle.totalRooms ?? 1);
  const total = useMemo(() => (vehicle.priceFromVnd ?? 0) * days * quantity, [vehicle.priceFromVnd, days, quantity]);
  const depositTotal = vehicle.depositVnd * quantity;

  function validate() {
    const next: Record<string, string> = {};
    if (!pickupDate) next.pickupDate = "Vui lòng chọn ngày nhận xe";
    if (!returnDate) next.returnDate = "Vui lòng chọn ngày trả xe";
    if (pickupDate && returnDate && returnDate < pickupDate) next.returnDate = "Ngày trả xe phải sau ngày nhận xe";
    if (!pickupLocation.trim()) next.pickupLocation = "Vui lòng nhập khu vực nhận xe";
    if (!name.trim()) next.name = "Vui lòng nhập họ tên";
    if (!/^0\d{9}$/.test(phone.trim())) next.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Email không hợp lệ";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const res = await fetch("/api/rental-inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placeId: vehicle.id,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        quantity,
        pickupDate,
        returnDate,
        pickupLocation: pickupLocation.trim(),
        note: note.trim() || undefined,
      }),
    });
    setSubmitting(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErrors({
        form:
          typeof data.error === "string" && res.status === 409
            ? data.error
            : "Không thể gửi yêu cầu, vui lòng thử lại hoặc gọi trực tiếp.",
      });
      return;
    }
    setDeposit(data.deposit ?? null);
    setDone(true);
    clearDraft("rental", vehicle.id);
    // Nhớ đơn trên thiết bị để khách tra cứu / quay lại thanh toán mà không cần đăng nhập
    if (data.deposit?.ref) {
      rememberOrder({
        ref: data.deposit.ref,
        phone: phone.trim(),
        kind: "rental",
        placeId: vehicle.id,
        placeName: vehicle.name,
        createdAt: Date.now(),
      });
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Đặt thuê xe"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[20px] shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <p className="font-display font-bold text-lg text-slate-800">Đặt thuê xe</p>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
          </button>
        </div>

        {done && deposit ? (
          <div className="p-5">
            <DepositQrPanel
              deposit={deposit}
              phone={phone}
              breakdown={quantity > 1 ? `${formatVnd(vehicle.depositVnd)} x ${quantity} xe` : undefined}
            />
            <button type="button" onClick={onClose} className="mt-4 w-full bg-brand-blue text-white font-bold rounded-xl py-2.5">
              Đóng
            </button>
          </div>
        ) : done ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-brand-greenBg text-brand-green flex items-center justify-center mx-auto mb-3 text-2xl">
              <i className="fa-solid fa-check" aria-hidden="true" />
            </div>
            <p className="font-bold text-slate-800 mb-1">Đã gửi yêu cầu đặt xe!</p>
            <p className="text-sm text-slate-500 mb-4">
              Chúng tôi sẽ liên hệ số <strong>{phone}</strong> để xác nhận trong thời gian sớm nhất.
              {vehicle.phone && (
                <>
                  {" "}
                  Bạn cũng có thể gọi trực tiếp{" "}
                  <a href={`tel:${vehicle.phone}`} className="text-brand-blue font-semibold">
                    {vehicle.phone}
                  </a>
                  .
                </>
              )}
            </p>
            <button type="button" onClick={onClose} className="bg-brand-blue text-white font-bold rounded-xl px-6 py-2.5">
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <RememberedOrderBanner kind="rental" placeId={vehicle.id} />
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
              <div className="relative w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                {vehicle.avatar && <Image src={vehicle.avatar} alt={vehicle.name} fill className="object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-800 truncate">{vehicle.name}</p>
                <p className="text-xs text-slate-400">{formatVnd(vehicle.priceFromVnd ?? 0)} / ngày</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">Ngày nhận xe</label>
                <input
                  type="date"
                  value={pickupDate}
                  min={todayStr()}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                />
                {errors.pickupDate && <p className="text-xs text-brand-red mt-1">{errors.pickupDate}</p>}
              </div>
              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">Ngày trả xe</label>
                <input
                  type="date"
                  value={returnDate}
                  min={pickupDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                />
                {errors.returnDate && <p className="text-xs text-brand-red mt-1">{errors.returnDate}</p>}
              </div>
            </div>

            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Khu vực nhận xe</label>
              <input
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="VD: Mũi Né, Phan Thiết..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
              {errors.pickupLocation && <p className="text-xs text-brand-red mt-1">{errors.pickupLocation}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">Họ tên</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                />
                {errors.name && <p className="text-xs text-brand-red mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số điện thoại</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                />
                {errors.phone && <p className="text-xs text-brand-red mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">Email (không bắt buộc)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="de-nhan-xac-nhan@email.com"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                />
                {errors.email && <p className="text-xs text-brand-red mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">
                  Số xe cần thuê{stock > 1 ? " (tối đa " + stock + ")" : ""}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Giảm số xe"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl border border-slate-200 text-lg font-bold text-slate-600 hover:bg-slate-50"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-extrabold text-slate-800">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Tăng số xe"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    className="w-10 h-10 rounded-xl border border-slate-200 text-lg font-bold text-slate-600 hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Ghi chú (không bắt buộc)</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>

            <div className="bg-brand-sky/30 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Số ngày thuê</span>
                <span className="font-semibold text-slate-700">{days} ngày</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Giá / ngày</span>
                <span className="font-semibold text-slate-700">{formatVnd(vehicle.priceFromVnd ?? 0)}</span>
              </div>
              {quantity > 1 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Số xe</span>
                  <span className="font-semibold text-slate-700">{quantity} xe</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1.5 border-t border-sky-100">
                <span className="font-bold text-slate-700">Tạm tính</span>
                <span className="font-extrabold text-brand-blue text-lg">{formatVnd(total)}</span>
              </div>
              {vehicle.depositEnabled && (
                <div className="flex items-center justify-between text-sm pt-1.5 border-t border-sky-100">
                  <span className="text-slate-500">
                    Cọc giữ chỗ ({formatVnd(vehicle.depositVnd)}
                    {quantity > 1 ? " x " + quantity + " xe" : ""})
                  </span>
                  <span className="font-bold text-amber-600">{formatVnd(depositTotal)}</span>
                </div>
              )}
            </div>

            {errors.form && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{errors.form}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl py-3 disabled:opacity-60"
            >
              {submitting ? "Đang gửi..." : "Xác nhận đặt xe"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

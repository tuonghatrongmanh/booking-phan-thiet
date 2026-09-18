"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DepositQrPanel, { type DepositInfo } from "@/components/booking/DepositQrPanel";

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function nightsBetween(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export type StayBookingModalProps = {
  placeId: string;
  placeName: string;
  priceFromVnd: number | null;
  phone: string | null;
  initialCheckin?: string;
  initialCheckout?: string;
  initialGuests?: number;
  onClose: () => void;
};

export default function StayBookingModal({
  placeId,
  placeName,
  priceFromVnd,
  phone: placePhone,
  initialCheckin,
  initialCheckout,
  initialGuests,
  onClose,
}: StayBookingModalProps) {
  const [checkin, setCheckin] = useState(initialCheckin || todayStr());
  const [checkout, setCheckout] = useState(initialCheckout || "");
  const [guests, setGuests] = useState(String(initialGuests ?? 2));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [deposit, setDeposit] = useState<DepositInfo | null>(null);

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

  const nights = checkin && checkout ? nightsBetween(checkin, checkout) : 0;
  const total = useMemo(() => (priceFromVnd ?? 0) * Math.max(nights, 0), [priceFromVnd, nights]);

  function validate() {
    const next: Record<string, string> = {};
    if (!checkin) next.checkin = "Vui lòng chọn ngày nhận phòng";
    if (!checkout) next.checkout = "Vui lòng chọn ngày trả phòng";
    if (checkin && checkout && checkout <= checkin) next.checkout = "Ngày trả phòng phải sau ngày nhận phòng";
    if (!name.trim()) next.name = "Vui lòng nhập họ tên";
    if (!/^0\d{9}$/.test(phone.trim())) next.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const res = await fetch("/api/stay-booking-inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placeId,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        checkinDate: checkin,
        checkoutDate: checkout,
        guestCount: Number(guests) || undefined,
        note: note.trim() || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

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
  }

  if (typeof document === "undefined") return null;

  const inputCls =
    "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40";

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Đặt phòng"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[20px] shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <p className="font-display font-bold text-lg text-slate-800">Đặt phòng</p>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
          </button>
        </div>

        {done ? (
          <div className="p-5">
            {deposit ? (
              <DepositQrPanel deposit={deposit} phone={phone} />
            ) : (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-brand-greenBg text-brand-green flex items-center justify-center mx-auto mb-3 text-2xl">
                  <i className="fa-solid fa-check" aria-hidden="true" />
                </div>
                <p className="font-bold text-slate-800 mb-1">Đã gửi yêu cầu đặt phòng!</p>
                <p className="text-sm text-slate-500">
                  Chúng tôi sẽ liên hệ số <strong>{phone}</strong> để xác nhận trong thời gian sớm nhất.
                  {placePhone && (
                    <>
                      {" "}
                      Bạn cũng có thể gọi trực tiếp{" "}
                      <a href={`tel:${placePhone}`} className="text-brand-blue font-semibold">
                        {placePhone}
                      </a>
                      .
                    </>
                  )}
                </p>
              </div>
            )}
            <button type="button" onClick={onClose} className="mt-4 w-full bg-brand-blue text-white font-bold rounded-xl py-2.5">
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className="font-bold text-sm text-slate-800 bg-slate-50 rounded-xl p-3">{placeName}</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sb-checkin" className="text-[13px] text-slate-500 font-medium mb-1 block">Nhận phòng</label>
                <input id="sb-checkin" type="date" min={todayStr()} value={checkin} onChange={(e) => setCheckin(e.target.value)} className={inputCls} />
                {errors.checkin && <p className="text-xs text-brand-red mt-1">{errors.checkin}</p>}
              </div>
              <div>
                <label htmlFor="sb-checkout" className="text-[13px] text-slate-500 font-medium mb-1 block">Trả phòng</label>
                <input id="sb-checkout" type="date" min={checkin || todayStr()} value={checkout} onChange={(e) => setCheckout(e.target.value)} className={inputCls} />
                {errors.checkout && <p className="text-xs text-brand-red mt-1">{errors.checkout}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="sb-guests" className="text-[13px] text-slate-500 font-medium mb-1 block">Số khách</label>
              <input id="sb-guests" type="number" min={1} max={50} value={guests} onChange={(e) => setGuests(e.target.value)} className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sb-name" className="text-[13px] text-slate-500 font-medium mb-1 block">Họ tên</label>
                <input id="sb-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                {errors.name && <p className="text-xs text-brand-red mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="sb-phone" className="text-[13px] text-slate-500 font-medium mb-1 block">Số điện thoại</label>
                <input id="sb-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912345678" className={inputCls} />
                {errors.phone && <p className="text-xs text-brand-red mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="sb-note" className="text-[13px] text-slate-500 font-medium mb-1 block">Ghi chú (không bắt buộc)</label>
              <textarea id="sb-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
            </div>

            {priceFromVnd != null && nights > 0 && (
              <div className="bg-brand-sky/30 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{formatVnd(priceFromVnd)} x {nights} đêm</span>
                  <span className="font-extrabold text-brand-blue text-lg">{formatVnd(total)}</span>
                </div>
                <p className="text-[11px] text-slate-400">Giá tạm tính từ mức giá thấp nhất, giá chính thức nhân viên sẽ xác nhận.</p>
              </div>
            )}

            {errors.form && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{errors.form}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl py-3 disabled:opacity-60"
            >
              {submitting ? "Đang gửi..." : "Gửi yêu cầu đặt phòng"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

function nightsBetween(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

// Gói phòng do admin tạo cho từng homestay (phòng đơn / phòng đôi / nguyên căn...),
// mỗi gói có tiền cọc riêng. Chỗ ở chưa có gói nào thì đặt cả chỗ ở với 1 mức cọc.
export type StayBookingOption = {
  id: string;
  label: string;
  depositVnd: number;
  priceVnd: number | null;
  maxUnits: number;
  wholeProperty: boolean;
};

export type StayBookingConfig = {
  options: StayBookingOption[];
  legacyDepositVnd: number;
  depositEnabled: boolean;
};

export type StayBookingModalProps = {
  placeId: string;
  placeName: string;
  priceFromVnd: number | null;
  phone: string | null;
  booking: StayBookingConfig;
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
  booking,
  initialCheckin,
  initialCheckout,
  initialGuests,
  onClose,
}: StayBookingModalProps) {
  // Khôi phục thông tin khách đã nhập lần trước (liên hệ dùng chung + nháp riêng của chỗ ở này)
  // để lỡ thoát form rồi mở lại không phải nhập lại từ đầu. Ngày khách vừa chọn ngay trên
  // thẻ đặt phòng (initialCheckin/...) được ưu tiên hơn nháp cũ.
  const [saved] = useState(() => ({ contact: loadContact(), draft: loadDraft("stay", placeId) }));
  const draftCheckin = draftStr(saved.draft, "checkin");
  const startCheckin = initialCheckin || (draftCheckin && draftCheckin >= todayStr() ? draftCheckin : todayStr());
  const draftCheckout = draftStr(saved.draft, "checkout");
  const draftOption = draftStr(saved.draft, "optionId");
  const [checkin, setCheckin] = useState(startCheckin);
  const [checkout, setCheckout] = useState(initialCheckout || (draftCheckout > startCheckin ? draftCheckout : ""));
  const [guests, setGuests] = useState(String(initialGuests ?? draftNum(saved.draft, "guests", 2)));
  const [optionId, setOptionId] = useState(
    booking.options.some((o) => o.id === draftOption) ? draftOption : (booking.options[0]?.id ?? "")
  );
  const [quantity, setQuantity] = useState(Math.max(1, draftNum(saved.draft, "quantity", 1)));
  const [name, setName] = useState(saved.contact.name);
  const [phone, setPhone] = useState(saved.contact.phone);
  const [email, setEmail] = useState(saved.contact.email);
  const [note, setNote] = useState(draftStr(saved.draft, "note"));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [deposit, setDeposit] = useState<DepositInfo | null>(null);

  // Tự lưu nháp mỗi khi khách sửa (sau khi đặt xong thì thôi, tránh lưu lại đơn đã gửi)
  useEffect(() => {
    if (done) return;
    saveContact({ name, phone, email });
    saveDraft("stay", placeId, { checkin, checkout, guests, optionId, quantity, note });
  }, [done, name, phone, email, checkin, checkout, guests, optionId, quantity, note, placeId]);

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

  const option = booking.options.find((o) => o.id === optionId) ?? null;
  const qty = option && !option.wholeProperty ? Math.min(quantity, option.maxUnits) : 1;
  const nights = checkin && checkout ? nightsBetween(checkin, checkout) : 0;
  const unitPrice = option?.priceVnd ?? priceFromVnd;
  const total = (unitPrice ?? 0) * Math.max(nights, 0) * qty;
  const depositTotal = option ? option.depositVnd * qty : booking.legacyDepositVnd;
  const breakdown = option ? option.label + (qty > 1 ? `: ${formatVnd(option.depositVnd)} x ${qty} phòng` : "") : undefined;

  function validate() {
    const next: Record<string, string> = {};
    if (!checkin) next.checkin = "Vui lòng chọn ngày nhận phòng";
    if (!checkout) next.checkout = "Vui lòng chọn ngày trả phòng";
    if (checkin && checkout && checkout <= checkin) next.checkout = "Ngày trả phòng phải sau ngày nhận phòng";
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
    const res = await fetch("/api/stay-booking-inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placeId,
        optionId: option?.id,
        quantity: qty,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
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
          typeof data.error === "string" && (res.status === 409 || res.status === 400)
            ? data.error
            : "Không thể gửi yêu cầu, vui lòng thử lại hoặc gọi trực tiếp.",
      });
      return;
    }
    setDeposit(data.deposit ?? null);
    setDone(true);
    clearDraft("stay", placeId);
    // Nhớ đơn trên thiết bị để khách tra cứu / quay lại thanh toán mà không cần đăng nhập
    if (data.deposit?.ref) {
      rememberOrder({
        ref: data.deposit.ref,
        phone: phone.trim(),
        kind: "stay",
        placeId,
        placeName,
        createdAt: Date.now(),
      });
    }
  }

  if (typeof document === "undefined") return null;

  const inputCls =
    "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40";
  const labelCls = "text-[13px] text-slate-500 font-medium mb-1 block";

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
              <DepositQrPanel deposit={deposit} phone={phone} breakdown={breakdown} />
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
            <RememberedOrderBanner kind="stay" placeId={placeId} />
            <p className="font-bold text-sm text-slate-800 bg-slate-50 rounded-xl p-3">{placeName}</p>

            {booking.options.length > 0 && (
              <fieldset>
                <legend className={labelCls}>Chọn loại phòng</legend>
                <div className="space-y-2">
                  {booking.options.map((o) => (
                    <label
                      key={o.id}
                      className={`flex items-center gap-3 border rounded-xl px-3.5 py-2.5 cursor-pointer transition ${
                        o.id === optionId ? "border-brand-blue bg-brand-sky/20" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="stay-option"
                        checked={o.id === optionId}
                        onChange={() => {
                          setOptionId(o.id);
                          setQuantity(1);
                        }}
                        className="accent-brand-blue"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-slate-800">{o.label}</span>
                        <span className="block text-xs text-slate-400">
                          {o.priceVnd != null ? `${formatVnd(o.priceVnd)} / đêm · ` : ""}
                          {booking.depositEnabled ? `cọc ${formatVnd(o.depositVnd)}${o.wholeProperty ? "" : " / phòng"}` : ""}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sb-checkin" className={labelCls}>Nhận phòng</label>
                <input id="sb-checkin" type="date" min={todayStr()} value={checkin} onChange={(e) => setCheckin(e.target.value)} className={inputCls} />
                {errors.checkin && <p className="text-xs text-brand-red mt-1">{errors.checkin}</p>}
              </div>
              <div>
                <label htmlFor="sb-checkout" className={labelCls}>Trả phòng</label>
                <input id="sb-checkout" type="date" min={checkin || todayStr()} value={checkout} onChange={(e) => setCheckout(e.target.value)} className={inputCls} />
                {errors.checkout && <p className="text-xs text-brand-red mt-1">{errors.checkout}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sb-guests" className={labelCls}>Số khách</label>
                <input id="sb-guests" type="number" min={1} max={50} value={guests} onChange={(e) => setGuests(e.target.value)} className={inputCls} />
              </div>
              {option && !option.wholeProperty && option.maxUnits > 1 && (
                <div>
                  <span className={labelCls}>Số phòng (tối đa {option.maxUnits})</span>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label="Giảm số phòng" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 rounded-xl border border-slate-200 text-lg font-bold text-slate-600 hover:bg-slate-50">-</button>
                    <span className="w-10 text-center font-extrabold text-slate-800">{qty}</span>
                    <button type="button" aria-label="Tăng số phòng" onClick={() => setQuantity((q) => Math.min(option.maxUnits, q + 1))} className="w-10 h-10 rounded-xl border border-slate-200 text-lg font-bold text-slate-600 hover:bg-slate-50">+</button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sb-name" className={labelCls}>Họ tên</label>
                <input id="sb-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                {errors.name && <p className="text-xs text-brand-red mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="sb-phone" className={labelCls}>Số điện thoại</label>
                <input id="sb-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912345678" inputMode="tel" className={inputCls} />
                {errors.phone && <p className="text-xs text-brand-red mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="sb-email" className={labelCls}>Email (không bắt buộc - để nhận xác nhận qua email)</label>
              <input id="sb-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ten@email.com" className={inputCls} />
              {errors.email && <p className="text-xs text-brand-red mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="sb-note" className={labelCls}>Ghi chú (không bắt buộc)</label>
              <textarea id="sb-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
            </div>

            {(total > 0 || booking.depositEnabled) && (
              <div className="bg-brand-sky/30 rounded-xl p-4 space-y-1.5">
                {total > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {formatVnd(unitPrice ?? 0)} x {nights} đêm{qty > 1 ? ` x ${qty} phòng` : ""}
                    </span>
                    <span className="font-extrabold text-brand-blue text-lg">{formatVnd(total)}</span>
                  </div>
                )}
                {booking.depositEnabled && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Cọc giữ chỗ</span>
                    <span className="font-bold text-amber-600">{formatVnd(depositTotal)}</span>
                  </div>
                )}
                <p className="text-[11px] text-slate-400">Giá tạm tính, giá chính thức nhân viên sẽ xác nhận.</p>
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

"use client";

import { useCallback, useEffect, useState } from "react";
import DepositQrPanel from "@/components/booking/DepositQrPanel";
import { loadOrders, rememberOrder, forgetOrder } from "@/lib/booking-device";
import type { PublicBooking } from "@/lib/booking-serialize";

// Dữ liệu qua JSON: các trường Date trở thành chuỗi.
export type Booking = Omit<PublicBooking, "depositPaidAt" | "createdAt"> & { depositPaidAt: string | null; createdAt: string };

const STATUS_LABEL: Record<Booking["status"], string> = {
  PENDING: "Chờ nhân viên liên hệ",
  CONTACTED: "Nhân viên đã liên hệ",
  DONE: "Hoàn tất",
  CANCELLED: "Đã huỷ",
};

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`;
}

function DepositLine({ r }: { r: Booking }) {
  if (r.status === "CANCELLED") return <span className="text-slate-500">Đơn đã huỷ</span>;
  if (r.depositStatus === "PAID") {
    return <span className="text-brand-green font-bold">Đã nhận cọc - giữ chỗ thành công</span>;
  }
  if (r.depositStatus === "PENDING") {
    if (r.reportedPaid) return <span className="text-amber-600 font-bold">Đã báo chuyển khoản - chờ nhân viên kiểm tra</span>;
    if (r.claimRejected) return <span className="text-brand-red font-bold">Nhân viên chưa thấy tiền về</span>;
    if (r.expired) return <span className="text-slate-500 font-bold">Quá hạn cọc (trên 24 giờ) - nên đặt lại</span>;
    return <span className="text-amber-600 font-bold">Chờ chuyển khoản cọc</span>;
  }
  return <span className="text-slate-500">Không yêu cầu cọc</span>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-right">{children}</dd>
    </div>
  );
}

export function OrderCard({ r, onChange }: { r: Booking; onChange: () => void }) {
  const showQr = r.deposit && r.depositStatus === "PENDING" && r.status !== "CANCELLED";
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="font-display font-bold text-lg text-slate-800">{r.placeName}</p>
        {r.depositRef && <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 rounded-md px-2 py-1">{r.depositRef}</span>}
      </div>
      <dl className="text-sm space-y-1.5">
        <Row label="Khách">{r.customerName}</Row>
        <Row label="Ngày">{r.dateText}</Row>
        {r.detailText && <Row label="Chi tiết">{r.detailText}</Row>}
        {r.depositAmount != null && <Row label="Tiền cọc">{formatVnd(r.depositAmount)}</Row>}
        <Row label="Trạng thái đơn">{STATUS_LABEL[r.status]}</Row>
        <Row label="Cọc">
          <DepositLine r={r} />
        </Row>
      </dl>
      {showQr && r.deposit && (
        <div className="border-t border-slate-100 pt-4">
          <DepositQrPanel
            key={String(r.reportedPaid) + String(r.claimRejected)}
            deposit={r.deposit}
            phone={r.customerPhone}
            showHeader={false}
            claim={{ reported: r.reportedPaid, rejected: r.claimRejected, canReport: r.canReport, blockedReason: r.reportBlockedReason }}
            onClaimChange={onChange}
          />
        </div>
      )}
    </div>
  );
}

export async function fetchLookup(ref: string, phone: string): Promise<Booking | null> {
  try {
    const res = await fetch("/api/booking-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, phone }),
    });
    if (!res.ok) return null;
    return (await res.json()) as Booking;
  } catch {
    return null;
  }
}

export default function BookingLookupClient({ initialRef }: { initialRef: string }) {
  const [account, setAccount] = useState<Booking[]>([]);
  const [device, setDevice] = useState<Booking[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [ref, setRef] = useState(initialRef);
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState<Booking | null>(null);

  const loadLists = useCallback(async () => {
    const [mine, remembered] = await Promise.all([
      fetch("/api/my-bookings")
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .catch(() => ({ items: [] })),
      Promise.all(loadOrders().map(async (o) => ({ o, data: await fetchLookup(o.ref, o.phone) }))),
    ]);
    const accountItems = (mine.items ?? []) as Booking[];
    const accountRefs = new Set(accountItems.map((b) => b.depositRef));
    // Đơn đã tra cứu không còn hợp lệ (bị xóa...) thì bỏ khỏi bộ nhớ thiết bị
    for (const { o, data } of remembered) if (!data) forgetOrder(o.ref);
    setAccount(accountItems);
    setDevice(remembered.flatMap(({ data }) => (data && !accountRefs.has(data.depositRef) ? [data] : [])));
    setLoadingLists(false);
  }, []);

  useEffect(() => {
    // Hoãn sang tick sau để việc cập nhật state không diễn ra đồng bộ trong effect
    const t = setTimeout(() => void loadLists(), 0);
    return () => clearTimeout(t);
  }, [loadLists]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setManual(null);
    const res = await fetch("/api/booking-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, phone }),
    });
    const data = await res.json().catch(() => ({}));
    setSearching(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }
    const found = data as Booking;
    setManual(found);
    if (found.depositRef) {
      rememberOrder({
        ref: found.depositRef,
        phone: found.customerPhone,
        kind: found.kind,
        placeId: "",
        placeName: found.placeName,
        createdAt: new Date(found.createdAt).getTime(),
      });
    }
  }

  async function refreshManual() {
    if (manual?.depositRef) setManual(await fetchLookup(manual.depositRef, manual.customerPhone));
  }

  const inputCls =
    "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 bg-white";
  const hasAny = account.length + device.length > 0;

  return (
    <div className="space-y-6">
      {loadingLists && <p className="text-sm text-slate-400">Đang tải các đơn của bạn...</p>}

      {account.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-slate-700">Đơn của tài khoản bạn</h2>
          {account.map((b) => (
            <OrderCard key={b.depositRef ?? b.createdAt} r={b} onChange={loadLists} />
          ))}
        </section>
      )}

      {device.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-slate-700">Đơn bạn đã đặt trên thiết bị này</h2>
          {device.map((b) => (
            <OrderCard key={b.depositRef ?? b.createdAt} r={b} onChange={loadLists} />
          ))}
        </section>
      )}

      {!loadingLists && !hasAny && (
        <p className="text-sm text-slate-500 bg-white rounded-2xl shadow-card p-4">
          Chưa có đơn nào được lưu trên thiết bị này. Nếu bạn đặt bằng máy khác, hãy nhập mã đơn và số điện thoại bên dưới.
          Đăng nhập tài khoản thì các đơn đặt khi đã đăng nhập sẽ tự hiện ở đây.
        </p>
      )}

      <section className="space-y-3">
        <h2 className="font-bold text-slate-700">Tra cứu bằng mã đơn</h2>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-5 space-y-4">
          <div>
            <label htmlFor="bl-ref" className="text-[13px] text-slate-500 font-medium mb-1 block">Mã đơn</label>
            <input id="bl-ref" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} placeholder="BPTK3M9QX" className={`${inputCls} font-mono`} />
          </div>
          <div>
            <label htmlFor="bl-phone" className="text-[13px] text-slate-500 font-medium mb-1 block">Số điện thoại đã đặt</label>
            <input id="bl-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912345678" inputMode="tel" className={inputCls} />
          </div>
          {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={searching} className="w-full bg-brand-blue text-white font-bold rounded-xl py-3 disabled:opacity-60">
            {searching ? "Đang tra cứu..." : "Tra cứu"}
          </button>
        </form>
        {manual && <OrderCard r={manual} onChange={refreshManual} />}
      </section>
    </div>
  );
}

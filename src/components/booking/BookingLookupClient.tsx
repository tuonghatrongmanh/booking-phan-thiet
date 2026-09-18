"use client";

import { useState } from "react";
import DepositQrPanel, { type DepositInfo } from "@/components/booking/DepositQrPanel";

type LookupResult = {
  kind: "stay" | "rental";
  placeName: string;
  dateText: string;
  detailText: string | null;
  customerName: string;
  status: "PENDING" | "CONTACTED" | "DONE" | "CANCELLED";
  depositStatus: "NONE" | "PENDING" | "PAID";
  depositAmount: number | null;
  depositRef: string | null;
  reportedPaid: boolean;
  deposit: DepositInfo | null;
};

const STATUS_LABEL: Record<LookupResult["status"], string> = {
  PENDING: "Chờ nhân viên liên hệ",
  CONTACTED: "Nhân viên đã liên hệ",
  DONE: "Hoàn tất",
  CANCELLED: "Đã huỷ",
};

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`;
}

function DepositLine({ r }: { r: LookupResult }) {
  if (r.status === "CANCELLED") return <span className="text-slate-500">Đơn đã huỷ</span>;
  if (r.depositStatus === "PAID") {
    return <span className="text-brand-green font-bold">Đã nhận cọc - giữ chỗ thành công</span>;
  }
  if (r.depositStatus === "PENDING") {
    return (
      <span className="text-amber-600 font-bold">
        {r.reportedPaid ? "Bạn đã báo chuyển khoản - đang chờ nhân viên kiểm tra" : "Chờ chuyển khoản cọc"}
      </span>
    );
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

export default function BookingLookupClient({ initialRef }: { initialRef: string }) {
  const [ref, setRef] = useState(initialRef);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await fetch("/api/booking-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, phone }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }
    setResult(data as LookupResult);
  }

  const inputCls =
    "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 bg-white";

  return (
    <div className="space-y-5">
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
        <button type="submit" disabled={loading} className="w-full bg-brand-blue text-white font-bold rounded-xl py-3 disabled:opacity-60">
          {loading ? "Đang tra cứu..." : "Tra cứu"}
        </button>
      </form>

      {result && (
        <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
          <p className="font-display font-bold text-lg text-slate-800">{result.placeName}</p>
          <dl className="text-sm space-y-1.5">
            <Row label="Khách">{result.customerName}</Row>
            <Row label="Ngày">{result.dateText}</Row>
            {result.detailText && <Row label="Chi tiết">{result.detailText}</Row>}
            {result.depositAmount != null && <Row label="Tiền cọc">{formatVnd(result.depositAmount)}</Row>}
            <Row label="Trạng thái đơn">{STATUS_LABEL[result.status]}</Row>
            <Row label="Cọc"><DepositLine r={result} /></Row>
          </dl>
          {result.deposit && (
            <div className="border-t border-slate-100 pt-4">
              <DepositQrPanel deposit={result.deposit} phone={phone.trim()} showHeader={false} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

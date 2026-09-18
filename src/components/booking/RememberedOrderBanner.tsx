"use client";

import { useState } from "react";
import Link from "next/link";
import { OrderCard, fetchLookup, type Booking } from "@/components/booking/BookingLookupClient";
import { loadRecentOrderForPlace, type BookingKind } from "@/lib/booking-device";

const RECENT_MS = 3 * 24 * 60 * 60 * 1000;

// Đầu form đặt phòng/thuê xe: (1) nếu khách vừa đặt đúng xe/chỗ ở này trên thiết bị này thì
// gợi ý quay lại đơn đó (xem trạng thái, hiện lại mã QR nếu còn chờ cọc) thay vì phải
// điền lại từ đầu; (2) luôn có lối vào trang tra cứu đơn.
export default function RememberedOrderBanner({ kind, placeId }: { kind: BookingKind; placeId: string }) {
  const [order] = useState(() => loadRecentOrderForPlace(kind, placeId, RECENT_MS));
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [failed, setFailed] = useState(false);

  async function load() {
    if (!order) return;
    setLoading(true);
    setFailed(false);
    const data = await fetchLookup(order.ref, order.phone);
    setLoading(false);
    if (data) setBooking(data);
    else setFailed(true);
  }

  return (
    <div className="space-y-2">
      {order && !dismissed && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 space-y-2">
          <p className="text-sm text-amber-900">
            Bạn có <strong>đơn gần đây</strong> cho chỗ này (mã <span className="font-mono font-bold">{order.ref}</span>).
          </p>
          {!booking && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="bg-brand-blue text-white text-sm font-bold rounded-lg px-3.5 py-2 disabled:opacity-60"
              >
                {loading ? "Đang tải..." : "Xem đơn / tiếp tục thanh toán"}
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="text-sm font-semibold text-slate-600 border border-slate-200 bg-white rounded-lg px-3.5 py-2"
              >
                Đặt đơn mới
              </button>
            </div>
          )}
          {failed && <p className="text-xs text-brand-red">Không tải được đơn, vui lòng thử lại hoặc vào trang tra cứu.</p>}
          {booking && (
            <>
              <OrderCard r={booking} onChange={load} />
              <button
                type="button"
                onClick={() => {
                  setBooking(null);
                  setDismissed(true);
                }}
                className="text-sm font-semibold text-brand-blue hover:underline"
              >
                Đặt một đơn mới
              </button>
            </>
          )}
        </div>
      )}
      <p className="text-xs text-slate-500">
        Đã đặt trước đó?{" "}
        <Link href="/tra-cuu-dat-cho" className="font-semibold text-brand-blue hover:underline">
          Tra cứu đơn của bạn
        </Link>
      </p>
    </div>
  );
}

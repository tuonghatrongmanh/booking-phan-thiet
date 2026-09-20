"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Action = "contacted" | "arrived" | "undo-arrived" | "done";

// Nút cập nhật tiến độ đơn cho chủ nhà: đã liên hệ -> khách đã đến -> hoàn tất. Không có nút hủy (admin xử lý).
export default function PartnerOrderActions({ kind, id, status, deposit, arrived, canArrive, arriveFrom }: { kind: "stay" | "rental"; id: string; status: string; deposit: string; arrived: boolean; canArrive: boolean; arriveFrom: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: Action) {
    setBusy(action);
    setError(null);
    const res = await fetch(`/api/partner/orders/${kind}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return setError(typeof data.error === "string" ? data.error : "Không cập nhật được");
    router.refresh();
  }

  if (status === "CANCELLED") return null;
  if (status === "DONE") return <p className="mt-2 text-sm font-bold text-emerald-600"><i className="fa-solid fa-circle-check mr-1.5" aria-hidden="true" />Đã hoàn tất</p>;

  const btn = "text-sm font-bold rounded-full px-4 py-1.5 disabled:opacity-50 transition";
  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        {status === "PENDING" && !arrived && (
          <button type="button" disabled={busy !== null} onClick={() => act("contacted")} className={`${btn} border border-slate-200 text-slate-600 hover:bg-slate-50`}>Đã liên hệ khách</button>
        )}
        {!arrived && deposit === "PAID" && !canArrive && <span className="text-xs text-slate-400">Bấm &ldquo;Khách đã đến&rdquo; được từ ngày {arriveFrom}.</span>}
        {!arrived && deposit === "PAID" && canArrive && (
          <button type="button" disabled={busy !== null} onClick={() => act("arrived")} className={`${btn} bg-brand-blue text-white hover:brightness-95`}>{busy === "arrived" ? "..." : "Khách đã đến"}</button>
        )}
        {arrived && (
          <>
            <span className="text-sm font-bold text-brand-blue"><i className="fa-solid fa-person-walking-luggage mr-1.5" aria-hidden="true" />Khách đã đến</span>
            <button type="button" disabled={busy !== null} onClick={() => act("done")} className={`${btn} bg-emerald-600 text-white hover:brightness-95`}>{busy === "done" ? "..." : "Hoàn tất"}</button>
            <button type="button" disabled={busy !== null} onClick={() => act("undo-arrived")} className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline">Bấm nhầm? Hoàn tác</button>
          </>
        )}
        {!arrived && deposit !== "PAID" && <span className="text-xs text-slate-400">Chờ Booking Phan Thiết xác nhận cọc rồi mới đánh dấu khách đến được.</span>}
      </div>
      {error && <p className="mt-1.5 text-xs text-brand-red">{error}</p>}
    </div>
  );
}

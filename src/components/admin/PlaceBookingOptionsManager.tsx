"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

export type BookingOptionData = {
  id: string;
  label: string;
  depositVnd: number;
  priceVnd: number | null;
  maxUnits: number;
  wholeProperty: boolean;
};

type Draft = { label: string; depositVnd: string; priceVnd: string; maxUnits: string; wholeProperty: boolean };

const EMPTY: Draft = { label: "", depositVnd: "", priceVnd: "", maxUnits: "1", wholeProperty: false };

function toDraft(o: BookingOptionData): Draft {
  return {
    label: o.label,
    depositVnd: String(o.depositVnd),
    priceVnd: o.priceVnd != null ? String(o.priceVnd) : "",
    maxUnits: String(o.maxUnits),
    wholeProperty: o.wholeProperty,
  };
}

function toPayload(d: Draft) {
  return {
    label: d.label.trim(),
    depositVnd: Number(d.depositVnd),
    priceVnd: d.priceVnd.trim() === "" ? null : Number(d.priceVnd),
    maxUnits: Number(d.maxUnits) || 1,
    wholeProperty: d.wholeProperty,
  };
}

const inputCls = "w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40";

function DraftFields({ draft, onChange }: { draft: Draft; onChange: (d: Draft) => void }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.7fr_auto] gap-2 items-end">
      <div className="col-span-2 lg:col-span-1">
        <span className="text-[11px] text-slate-400">Tên gói</span>
        <input value={draft.label} onChange={(e) => onChange({ ...draft, label: e.target.value })} placeholder="Phòng đơn / Phòng đôi / Nguyên căn" className={inputCls} />
      </div>
      <div>
        <span className="text-[11px] text-slate-400">Tiền cọc (VNĐ)</span>
        <input type="number" min={0} value={draft.depositVnd} onChange={(e) => onChange({ ...draft, depositVnd: e.target.value })} placeholder="200000" className={inputCls} />
      </div>
      <div>
        <span className="text-[11px] text-slate-400">Giá / đêm (tham khảo)</span>
        <input type="number" min={0} value={draft.priceVnd} onChange={(e) => onChange({ ...draft, priceVnd: e.target.value })} placeholder="500000" className={inputCls} />
      </div>
      <div>
        <span className="text-[11px] text-slate-400">Số phòng</span>
        <input type="number" min={1} value={draft.wholeProperty ? "1" : draft.maxUnits} disabled={draft.wholeProperty} onChange={(e) => onChange({ ...draft, maxUnits: e.target.value })} className={inputCls} />
      </div>
      <label className="flex items-center gap-1.5 text-xs text-slate-600 pb-2 col-span-2 lg:col-span-1">
        <input type="checkbox" checked={draft.wholeProperty} onChange={(e) => onChange({ ...draft, wholeProperty: e.target.checked })} />
        Nguyên căn
      </label>
    </div>
  );
}

function OptionRow({ placeId, option }: { placeId: string; option: BookingOptionData }) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [draft, setDraft] = useState<Draft>(toDraft(option));
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await fetch(`/api/places/${placeId}/booking-options/${option.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(draft)),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(typeof data.error === "string" ? data.error : "Lưu thất bại", "error");
    toast("Đã lưu gói phòng", "success");
    router.refresh();
  }

  async function remove() {
    if (!(await confirm({ message: `Xóa gói "${option.label}"?`, confirmText: "Xóa", danger: true }))) return;
    setBusy(true);
    const res = await fetch(`/api/places/${placeId}/booking-options/${option.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(typeof data.error === "string" ? data.error : "Xóa thất bại", "error");
    router.refresh();
  }

  return (
    <div className="border border-slate-100 rounded-xl p-3 space-y-2">
      <DraftFields draft={draft} onChange={setDraft} />
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={save} disabled={busy} className="text-xs font-bold text-brand-blue hover:underline disabled:opacity-50">Lưu</button>
        <button type="button" onClick={remove} disabled={busy} className="text-xs font-bold text-brand-red hover:underline disabled:opacity-50">Xóa</button>
      </div>
    </div>
  );
}

export default function PlaceBookingOptionsManager({ placeId, options }: { placeId: string; options: BookingOptionData[] }) {
  const router = useRouter();
  const { toast } = useDialog();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [adding, setAdding] = useState(false);

  async function add() {
    setAdding(true);
    const res = await fetch(`/api/places/${placeId}/booking-options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(draft)),
    });
    const data = await res.json().catch(() => ({}));
    setAdding(false);
    if (!res.ok) return toast(typeof data.error === "string" ? data.error : "Thêm thất bại", "error");
    setDraft(EMPTY);
    toast("Đã thêm gói phòng", "success");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="font-display font-bold text-lg text-slate-800">Gói đặt phòng & tiền cọc</h2>
      <p className="text-sm text-slate-400 mb-4">
        Mỗi gói (VD: Phòng đơn cọc 200.000đ, Phòng đôi cọc 300.000đ, Nguyên căn cọc 1.000.000đ) có tiền cọc riêng. Khách chọn 1
        gói và số phòng khi đặt, tiền cọc = cọc của gói x số phòng. Gói &quot;Nguyên căn&quot; chặn cả chỗ ở trong những ngày đó.
        Chưa tạo gói nào thì khách đặt cả chỗ ở với mức cọc ghi ở form thông tin (hoặc mặc định trong Cài đặt).
      </p>

      <div className="space-y-3">
        {options.map((o) => (
          <OptionRow key={o.id} placeId={placeId} option={o} />
        ))}
        {options.length === 0 && <p className="text-sm text-slate-400">Chưa có gói phòng nào.</p>}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-700 mb-2">Thêm gói mới</p>
        <DraftFields draft={draft} onChange={setDraft} />
        <button
          type="button"
          onClick={add}
          disabled={adding}
          className="mt-3 bg-brand-blue text-white font-bold rounded-xl px-5 py-2 text-sm disabled:opacity-60"
        >
          {adding ? "Đang thêm..." : "Thêm gói"}
        </button>
      </div>
    </div>
  );
}

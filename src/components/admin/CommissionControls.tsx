"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

export function RateForm({ initial }: { initial: number }) {
  const router = useRouter();
  const { toast } = useDialog();
  const [percent, setPercent] = useState(String(initial));
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await fetch("/api/admin/commissions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ percent: Number(percent) }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(typeof data.error === "string" ? data.error : "Không lưu được", "error");
    toast("Đã lưu tỉ lệ hoa hồng", "success");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">% tiền cọc trả cho Sale giới thiệu</label>
        <div className="flex items-center gap-2">
          <input type="number" min={0} max={50} value={percent} onChange={(e) => setPercent(e.target.value)} className="w-24 border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40" />
          <span className="font-bold text-slate-500">%</span>
        </div>
      </div>
      <button type="button" onClick={save} disabled={busy} className="bg-brand-blue text-white font-bold rounded-full px-5 py-2.5 disabled:opacity-50 hover:brightness-95">
        {busy ? "Đang lưu..." : "Lưu"}
      </button>
    </div>
  );
}

export function PayButton({ ids, salePlaceId, label, message }: { ids?: string[]; salePlaceId?: string; label: string; message: string }) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [busy, setBusy] = useState(false);

  async function pay() {
    if (!(await confirm({ title: "Đánh dấu đã trả hoa hồng?", message, confirmText: "Đã chuyển khoản" }))) return;
    setBusy(true);
    const res = await fetch("/api/admin/commissions/pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, salePlaceId }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(typeof data.error === "string" ? data.error : "Không cập nhật được", "error");
    toast(`Đã ghi sổ ${data.count} hoa hồng`, "success");
    router.refresh();
  }

  return (
    <button type="button" onClick={pay} disabled={busy} className="text-xs font-bold text-brand-blue border border-brand-blueMid rounded-full px-3 py-1.5 hover:bg-brand-tint disabled:opacity-50">
      {busy ? "..." : label}
    </button>
  );
}

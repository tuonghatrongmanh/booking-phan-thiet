"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";
import SaleTaskRow, { type AdminTask } from "@/components/admin/SaleTaskRow";
import type { SaleTaskStatus } from "@/lib/sale-tasks";

const TABS: { key: string; label: string; statuses: SaleTaskStatus[] }[] = [
  { key: "todo", label: "Cần xử lý", statuses: ["REQUESTED", "SUBMITTED"] },
  { key: "assigned", label: "Đã giao", statuses: ["ASSIGNED"] },
  { key: "done", label: "Đã xong / từ chối", statuses: ["DONE", "REJECTED"] },
];

const INPUT = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30";

export default function SaleTasksManager({ tasks, sales }: { tasks: AdminTask[]; sales: { id: string; name: string }[] }) {
  const router = useRouter();
  const { toast } = useDialog();
  const [tab, setTab] = useState("todo");
  const [placeId, setPlaceId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bonus, setBonus] = useState(20);
  const [busy, setBusy] = useState(false);

  const current = TABS.find((t) => t.key === tab)!;
  const shown = tasks.filter((t) => current.statuses.includes(t.status));

  async function assign(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/admin/sale-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId, title, description, bonusPoints: bonus }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      toast(typeof data.error === "string" ? data.error : "Không giao được", "error");
      return;
    }
    toast("Đã giao nhiệm vụ cho Sale", "success");
    setTitle("");
    setDescription("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={assign} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-3">
        <p className="font-display font-bold text-slate-800">Giao nhiệm vụ trực tiếp</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <select required value={placeId} onChange={(e) => setPlaceId(e.target.value)} className={INPUT}>
            <option value="">— Chọn Sale —</option>
            {sales.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên nhiệm vụ" maxLength={120} className={INPUT} />
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Mô tả cách làm, tiêu chí hoàn thành" className={INPUT} />
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm text-slate-500 flex items-center gap-2">
            Điểm thưởng
            <input type="number" min={0} max={100} value={bonus} onChange={(e) => setBonus(Number(e.target.value))} className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
          <button type="submit" disabled={busy} className="bg-brand-blue text-white font-bold rounded-lg px-5 py-2 text-sm disabled:opacity-50">
            {busy ? "Đang giao..." : "Giao nhiệm vụ"}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`text-sm font-bold px-4 py-2 rounded-full transition ${tab === t.key ? "bg-brand-blue text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
          >
            {t.label} ({tasks.filter((x) => t.statuses.includes(x.status)).length})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-400">Không có nhiệm vụ nào ở mục này.</p>
      ) : (
        <div className="space-y-4">
          {shown.map((t) => (
            <SaleTaskRow key={t.id + t.status} task={t} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xử lý",
  FULFILLED: "Đã trao thưởng",
  CANCELLED: "Đã hủy (hoàn xu)",
};

export default function RedemptionStatusControl({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [saving, setSaving] = useState(false);

  async function updateStatus(next: string) {
    if (next === status) return;
    if (next === "CANCELLED" && !(await confirm({ message: "Hủy yêu cầu này và hoàn lại xu cho người dùng?", danger: true }))) return;

    setSaving(true);
    const res = await fetch(`/api/redemptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(typeof data.error === "string" ? data.error : "Có lỗi xảy ra", "error");
      return;
    }
    router.refresh();
  }

  return (
    <select
      value={status}
      disabled={saving}
      onChange={(e) => updateStatus(e.target.value)}
      className={`text-xs font-bold rounded-full px-2.5 py-1.5 border-0 outline-none disabled:opacity-50 ${
        status === "PENDING"
          ? "bg-amber-50 text-amber-600"
          : status === "FULFILLED"
          ? "bg-brand-greenBg text-brand-green"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {Object.entries(STATUS_LABEL).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

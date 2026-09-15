"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

export default function SaleApplicationStatusControl({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const { toast } = useDialog();
  const [saving, setSaving] = useState(false);

  async function updateStatus(next: string) {
    if (next === status) return;

    let note: string | null = null;
    if (next === "REJECTED") {
      note = window.prompt("Lý do từ chối (người dùng sẽ thấy nội dung này):");
      if (note === null) return;
    }

    setSaving(true);
    const res = await fetch(`/api/sale-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next, note }),
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
          : status === "APPROVED"
            ? "bg-brand-greenBg text-brand-green"
            : "bg-brand-redBg text-brand-red"
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

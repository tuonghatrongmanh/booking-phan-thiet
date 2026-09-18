"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ liên hệ",
  CONTACTED: "Đã liên hệ",
  DONE: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

export default function RentalInquiryStatusControl({
  id,
  status,
  statusUrl,
}: {
  id: string;
  status: string;
  statusUrl?: string;
}) {
  const router = useRouter();
  const { toast } = useDialog();
  const [saving, setSaving] = useState(false);

  async function updateStatus(next: string) {
    if (next === status) return;
    setSaving(true);
    const res = await fetch(statusUrl ?? `/api/admin/rental-inquiries/${id}`, {
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
          : status === "CONTACTED"
          ? "bg-brand-sky/50 text-brand-blue"
          : status === "DONE"
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

// Nut bat/tat nhanh 1 truong boolean (mac dinh "active") ngay trong danh sach, khong
// can vao form sua - dung cho Pop-up "bat tat pop-up khi nhan", va cho Game "bat/tat
// hien thi" + "sap ra mat" (truyen field="comingSoon" de doi truong khac "active").
export default function ToggleActiveButton({
  url,
  active,
  field = "active",
  activeLabel = "Đang bật",
  inactiveLabel = "Đang tắt",
}: {
  url: string;
  active: boolean;
  field?: string;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  const router = useRouter();
  const { toast } = useDialog();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !active }),
      });
      if (!res.ok) throw new Error("Không thể cập nhật");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs font-bold px-2.5 py-1 rounded-full transition disabled:opacity-50 ${
        active ? "text-brand-green bg-brand-greenBg hover:brightness-95" : "text-slate-500 bg-slate-100 hover:bg-slate-200"
      }`}
    >
      {loading ? "..." : active ? activeLabel : inactiveLabel}
    </button>
  );
}

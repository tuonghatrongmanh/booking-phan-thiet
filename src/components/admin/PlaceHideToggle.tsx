"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

// Nut an/hien 1 Place (Homestay/Xe/Dia diem). Voi SuperAdmin: an ngay. Voi nhan vien
// co quyen "hide=approval": request se tra ve 202 + queued=true - hien toast bao da
// gui yeu cau, KHONG doi UI ngay (van hien trang thai cu vi chua thuc su ap dung).
export default function PlaceHideToggle({ id, hidden }: { id: string; hidden: boolean }) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!hidden && !(await confirm({ message: "Ẩn địa điểm này khỏi trang công khai?" }))) return;
    setLoading(true);
    const res = await fetch(`/api/places/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: !hidden }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (res.status === 202 && data.queued) {
      toast(data.message ?? "Đã gửi yêu cầu, chờ duyệt", "info");
      return;
    }
    if (!res.ok) {
      toast(typeof data.error === "string" ? data.error : "Có lỗi xảy ra", "error");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition disabled:opacity-50 ${
        hidden ? "text-brand-red bg-brand-redBg hover:brightness-95" : "text-slate-500 bg-slate-100 hover:bg-slate-200"
      }`}
    >
      {hidden ? "Đang ẩn - Bấm để hiện" : "Ẩn"}
    </button>
  );
}

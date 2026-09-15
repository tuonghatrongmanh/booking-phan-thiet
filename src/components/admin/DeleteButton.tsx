"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

export default function DeleteButton({ url, confirmText }: { url: string; confirmText: string }) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!(await confirm({ message: confirmText, confirmText: "Xóa", danger: true }))) return;
    setLoading(true);
    try {
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (res.status === 202 && data.queued) {
        toast(data.message ?? "Đã gửi yêu cầu, chờ duyệt", "info");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Xóa thất bại");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-brand-red hover:bg-brand-redBg rounded-lg px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-50"
    >
      {loading ? "Đang xóa..." : "Xóa"}
    </button>
  );
}

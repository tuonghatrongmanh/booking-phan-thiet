"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`;
}

export default function DepositBadge({
  status,
  amount,
  depositRef,
  confirmUrl,
}: {
  status: "NONE" | "PENDING" | "PAID";
  amount: number | null;
  depositRef?: string | null;
  confirmUrl: string;
}) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [loading, setLoading] = useState(false);

  if (status === "NONE") {
    return <span className="text-xs text-slate-300">Không cọc</span>;
  }

  if (status === "PAID") {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green bg-brand-greenBg rounded-full px-2.5 py-1 w-fit">
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          Đã nhận cọc{amount ? ` (${formatVnd(amount)})` : ""}
        </span>
        {depositRef && <span className="text-[11px] text-slate-400 font-mono">Mã CK: {depositRef}</span>}
      </div>
    );
  }

  async function handleConfirm() {
    const ok = await confirm({
      message: `Xác nhận đã nhận đủ ${amount ? formatVnd(amount) : "tiền"} cọc${depositRef ? ` (nội dung chuyển khoản ${depositRef})` : ""} qua tài khoản ngân hàng của bạn? Hãy kiểm tra kỹ sao kê trước khi xác nhận.`,
    });
    if (!ok) return;

    setLoading(true);
    const res = await fetch(confirmUrl, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      toast(typeof data.error === "string" ? data.error : "Có lỗi xảy ra", "error");
      return;
    }
    toast("Đã xác nhận nhận cọc", "success");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-amber-600 bg-amber-50 rounded-full px-2.5 py-1 w-fit">
        Chờ chuyển khoản{amount ? ` (${formatVnd(amount)})` : ""}
      </span>
      {depositRef && <span className="text-[11px] text-slate-500 font-mono">Mã CK: {depositRef}</span>}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className="text-xs font-bold text-brand-blue hover:underline disabled:opacity-60 text-left"
      >
        {loading ? "Đang xác nhận..." : "Xác nhận đã nhận cọc"}
      </button>
    </div>
  );
}

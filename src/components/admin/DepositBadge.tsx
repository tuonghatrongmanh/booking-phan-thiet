"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`;
}

// Cột "Cọc" của trang quản lý đơn. Luồng: Chờ chuyển khoản -> (khách bấm "Tôi đã chuyển
// khoản") Khách báo đã chuyển -> admin kiểm tra ngân hàng -> "Xác nhận đã nhận cọc"
// hoặc "Chưa nhận được tiền". Lời khách báo CHƯA phải bằng chứng - chỉ có admin xác nhận.
export default function DepositBadge({
  status,
  amount,
  depositRef,
  reportedPaid,
  claimNote,
  claimRejected,
  claimCount,
  expired,
  confirmUrl,
  rejectUrl,
}: {
  status: "NONE" | "PENDING" | "PAID";
  amount: number | null;
  depositRef?: string | null;
  reportedPaid?: boolean;
  claimNote?: string | null;
  claimRejected?: boolean;
  claimCount?: number;
  expired?: boolean;
  confirmUrl: string;
  rejectUrl: string;
}) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);

  if (status === "NONE") {
    return <span className="text-xs text-slate-300">Không cọc</span>;
  }

  if (status === "PAID") {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold text-brand-green bg-brand-greenBg rounded-full px-2.5 py-1 w-fit">
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          Đã nhận cọc{amount ? ` (${formatVnd(amount)})` : ""}
        </span>
        {depositRef && <span className="text-[11px] text-slate-400 font-mono">Mã CK: {depositRef}</span>}
      </div>
    );
  }

  async function post(url: string, kind: "confirm" | "reject", okMessage: string) {
    setLoading(kind);
    const res = await fetch(url, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    if (!res.ok) {
      toast(typeof data.error === "string" ? data.error : "Có lỗi xảy ra", "error");
      return;
    }
    toast(okMessage, "success");
    router.refresh();
  }

  async function handleConfirm() {
    const ok = await confirm({
      message: `Xác nhận đã nhận đủ ${amount ? formatVnd(amount) : "tiền"} cọc${depositRef ? ` (nội dung chuyển khoản ${depositRef})` : ""} qua tài khoản ngân hàng của bạn? Hãy kiểm tra kỹ sao kê trước khi xác nhận.`,
    });
    if (ok) await post(confirmUrl, "confirm", "Đã xác nhận nhận cọc");
  }

  async function handleReject() {
    const ok = await confirm({
      message: `Xác nhận CHƯA thấy tiền cọc${depositRef ? ` (mã ${depositRef})` : ""} trong tài khoản? Khách sẽ được báo lại (qua email nếu có) và chỉ được báo tối đa vài lần.`,
      confirmText: "Chưa nhận được",
      danger: true,
    });
    if (ok) await post(rejectUrl, "reject", "Đã ghi nhận: chưa nhận được tiền");
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold text-amber-700 bg-amber-50 rounded-full px-2.5 py-1">
        <i className="fa-regular fa-clock" aria-hidden="true" />
        Chờ chuyển khoản{amount ? ` · ${formatVnd(amount)}` : ""}
      </span>
      {depositRef && <span className="text-[11px] text-slate-500 font-mono">Mã CK: {depositRef}</span>}
      {expired && !reportedPaid && (
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">Quá hạn cọc (&gt;24 giờ) - nên huỷ đơn</span>
      )}
      {claimRejected && (
        <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
          Đã báo khách chưa nhận được tiền{claimCount ? ` (báo ${claimCount} lần)` : ""}
        </span>
      )}
      {reportedPaid && (
        <>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-brand-red rounded-full px-2.5 py-1">
            <i className="fa-solid fa-bell" aria-hidden="true" /> Khách báo đã chuyển - cần kiểm tra
          </span>
          {claimNote && <span className="text-[11px] text-slate-500">Khách ghi: {claimNote}</span>}
        </>
      )}
      <div className="flex flex-wrap items-center gap-2 mt-0.5">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading !== null}
          className="text-xs font-bold text-white bg-brand-green hover:brightness-95 rounded-lg px-3 py-1.5 disabled:opacity-60 whitespace-nowrap"
        >
          {loading === "confirm" ? "Đang xác nhận..." : "✓ Đã nhận cọc"}
        </button>
        {reportedPaid && (
          <button
            type="button"
            onClick={handleReject}
            disabled={loading !== null}
            className="text-xs font-bold text-brand-red border border-brand-red/40 hover:bg-brand-redBg rounded-lg px-3 py-1.5 disabled:opacity-60 whitespace-nowrap"
          >
            {loading === "reject" ? "Đang gửi..." : "Chưa nhận được"}
          </button>
        )}
      </div>
    </div>
  );
}

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
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green bg-brand-greenBg rounded-full px-2.5 py-1 w-fit">
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
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-amber-600 bg-amber-50 rounded-full px-2.5 py-1 w-fit">
        Chờ chuyển khoản{amount ? ` (${formatVnd(amount)})` : ""}
      </span>
      {depositRef && <span className="text-[11px] text-slate-500 font-mono">Mã CK: {depositRef}</span>}
      {expired && !reportedPaid && (
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 w-fit">
          Quá hạn cọc (&gt;24 giờ) - nên huỷ đơn
        </span>
      )}
      {claimRejected && (
        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 w-fit">
          Đã báo khách: chưa nhận được tiền{claimCount ? ` (khách đã báo ${claimCount} lần)` : ""}
        </span>
      )}
      {reportedPaid && (
        <>
          <span className="text-[11px] font-bold text-white bg-brand-red rounded-full px-2 py-0.5 w-fit">
            Khách báo đã chuyển (chưa xác minh) - kiểm tra ngân hàng
          </span>
          {claimNote && <span className="text-[11px] text-slate-500">Khách ghi: {claimNote}</span>}
        </>
      )}
      <div className="flex flex-col items-start gap-0.5 mt-0.5">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading !== null}
          className="text-xs font-bold text-brand-blue hover:underline disabled:opacity-60 text-left"
        >
          {loading === "confirm" ? "Đang xác nhận..." : "Xác nhận đã nhận cọc"}
        </button>
        {reportedPaid && (
          <button
            type="button"
            onClick={handleReject}
            disabled={loading !== null}
            className="text-xs font-bold text-brand-red hover:underline disabled:opacity-60 text-left"
          >
            {loading === "reject" ? "Đang gửi..." : "Chưa nhận được tiền"}
          </button>
        )}
      </div>
    </div>
  );
}

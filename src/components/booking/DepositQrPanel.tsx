"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type DepositInfo = {
  amount: number;
  ref: string;
  qrImageUrl: string;
  bankLabel: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
};

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard không khả dụng - người dùng vẫn có thể bôi đen chép tay
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="flex items-center gap-2 min-w-0">
        <span className="font-bold text-slate-800 truncate">{value}</span>
        <button type="button" onClick={copy} className="text-xs font-semibold text-brand-blue hover:underline shrink-0">
          {copied ? "Đã chép" : "Sao chép"}
        </button>
      </span>
    </div>
  );
}

// Màn hình đặt cọc giữ chỗ sau khi khách gửi yêu cầu đặt phòng/thuê xe: hiện QR
// VietQR + thông tin chuyển khoản thủ công (phòng khi quét không được).
// Nút "Tôi đã chuyển khoản" CHỈ nhắc admin kiểm tra ngân hàng (báo Telegram/chuông) -
// nó KHÔNG xác nhận cọc. Việc xác nhận đã nhận tiền vẫn là của admin, nên khách bấm
// bừa cũng không thể giữ chỗ giả (xem /api/booking-lookup/report-paid).
export default function DepositQrPanel({
  deposit,
  phone,
  breakdown,
  showHeader = true,
}: {
  deposit: DepositInfo;
  phone: string;
  breakdown?: string;
  showHeader?: boolean;
}) {
  const [reportState, setReportState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function reportPaid() {
    setReportState("sending");
    try {
      const res = await fetch("/api/booking-lookup/report-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: deposit.ref, phone }),
      });
      setReportState(res.ok ? "done" : "error");
    } catch {
      setReportState("error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        {showHeader && (
          <>
            <div className="w-12 h-12 rounded-full bg-brand-greenBg text-brand-green flex items-center justify-center mx-auto mb-2 text-xl">
              <i className="fa-solid fa-check" aria-hidden="true" />
            </div>
            <p className="font-bold text-slate-800">Đã ghi nhận yêu cầu của bạn!</p>
          </>
        )}
        <p className="text-sm text-slate-500 mt-1">
          Để <strong>giữ chỗ chắc chắn</strong>, vui lòng đặt cọc <strong className="text-brand-blue">{formatVnd(deposit.amount)}</strong>{" "}
          bằng cách quét mã QR bên dưới.
        </p>
        {breakdown && <p className="text-xs text-slate-400 mt-0.5">{breakdown}</p>}
      </div>

      <div className="flex justify-center">
        <Image
          src={deposit.qrImageUrl}
          alt="Mã QR chuyển khoản đặt cọc"
          width={260}
          height={260}
          unoptimized
          className="rounded-xl border border-slate-200 bg-white"
        />
      </div>

      <div className="bg-slate-50 rounded-xl p-3.5 space-y-2">
        {deposit.bankLabel && <CopyRow label="Ngân hàng" value={deposit.bankLabel} />}
        {deposit.bankAccountNumber && <CopyRow label="Số tài khoản" value={deposit.bankAccountNumber} />}
        {deposit.bankAccountName && <CopyRow label="Chủ tài khoản" value={deposit.bankAccountName} />}
        <CopyRow label="Số tiền" value={String(deposit.amount)} />
        <CopyRow label="Nội dung CK" value={deposit.ref} />
      </div>

      {reportState === "done" ? (
        <p className="text-sm text-brand-green bg-brand-greenBg rounded-xl px-3 py-2.5 text-center font-semibold">
          <i className="fa-solid fa-circle-check mr-1.5" aria-hidden="true" />
          Đã báo cho nhân viên! Chúng tôi sẽ kiểm tra và xác nhận sớm nhất.
        </p>
      ) : (
        <button
          type="button"
          onClick={reportPaid}
          disabled={reportState === "sending"}
          className="w-full border-2 border-brand-blue text-brand-blue font-bold rounded-xl py-2.5 hover:bg-brand-sky/30 transition disabled:opacity-60"
        >
          {reportState === "sending" ? "Đang gửi..." : "Tôi đã chuyển khoản"}
        </button>
      )}
      {reportState === "error" && (
        <p className="text-xs text-brand-red text-center">Không gửi được, vui lòng thử lại hoặc liên hệ nhân viên.</p>
      )}

      {showHeader && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-center">
          <p className="text-xs text-amber-700">Mã đơn của bạn (hãy lưu lại để tra cứu)</p>
          <p className="font-mono font-extrabold text-lg text-amber-900 tracking-wider">{deposit.ref}</p>
          <Link href={`/tra-cuu-dat-cho?ref=${deposit.ref}`} className="text-xs font-semibold text-brand-blue hover:underline">
            Tra cứu trạng thái đơn
          </Link>
        </div>
      )}

      <p className="text-xs text-slate-400 leading-relaxed">
        Vui lòng giữ <strong>đúng nội dung chuyển khoản</strong> ({deposit.ref}) để chúng tôi đối chiếu. Sau khi nhận được
        cọc, nhân viên sẽ xác nhận và liên hệ số <strong>{phone}</strong>. Chưa đặt cọc thì yêu cầu vẫn được ghi nhận, nhưng
        ngày này có thể được giữ cho khách khác đã cọc trước.
      </p>
    </div>
  );
}

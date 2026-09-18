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
  claim,
  onClaimChange,
}: {
  deposit: DepositInfo;
  phone: string;
  breakdown?: string;
  showHeader?: boolean;
  // Trạng thái "báo đã chuyển" của đơn (khi mở lại từ trang tra cứu). Mặc định: chưa báo.
  claim?: { reported: boolean; rejected: boolean; canReport: boolean; blockedReason: string | null };
  onClaimChange?: () => void;
}) {
  const [step, setStep] = useState<"idle" | "confirm" | "sending" | "done">(claim?.reported ? "done" : "idle");
  const [note, setNote] = useState("");
  const [reportError, setReportError] = useState<string | null>(null);
  const canReport = claim ? claim.canReport : true;

  async function reportPaid() {
    setStep("sending");
    setReportError(null);
    try {
      const res = await fetch("/api/booking-lookup/report-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: deposit.ref, phone, note: note.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReportError(typeof data.error === "string" ? data.error : "Không gửi được, vui lòng thử lại hoặc liên hệ nhân viên.");
        setStep("idle");
        return;
      }
      setStep("done");
      onClaimChange?.();
    } catch {
      setReportError("Không gửi được, vui lòng thử lại hoặc liên hệ nhân viên.");
      setStep("idle");
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

      {claim?.rejected && step !== "done" && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          Nhân viên đã kiểm tra nhưng <strong>chưa thấy tiền về tài khoản</strong>. Nếu bạn đã chuyển, hãy kiểm tra lại số tiền và
          nội dung chuyển khoản (<strong>{deposit.ref}</strong>) rồi báo lại, hoặc liên hệ trực tiếp nhân viên.
        </p>
      )}

      {step === "done" ? (
        <p className="text-sm text-brand-green bg-brand-greenBg rounded-xl px-3 py-2.5 text-center font-semibold">
          <i className="fa-solid fa-circle-check mr-1.5" aria-hidden="true" />
          Đã báo cho nhân viên! Chúng tôi sẽ kiểm tra ngân hàng và xác nhận sớm nhất. Đơn CHỈ được giữ chỗ sau khi nhân viên xác
          nhận đã nhận tiền.
        </p>
      ) : !canReport ? (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5 text-center">{claim?.blockedReason}</p>
      ) : step === "idle" ? (
        <button
          type="button"
          onClick={() => setStep("confirm")}
          className="w-full border-2 border-brand-blue text-brand-blue font-bold rounded-xl py-2.5 hover:bg-brand-sky/30 transition"
        >
          Tôi đã chuyển khoản
        </button>
      ) : (
        <div className="border-2 border-brand-blue rounded-xl p-3 space-y-2.5 bg-brand-sky/10">
          <p className="text-sm text-slate-700">
            Chỉ bấm khi bạn <strong>đã thực sự chuyển</strong> <strong>{formatVnd(deposit.amount)}</strong> với nội dung{" "}
            <strong>{deposit.ref}</strong>. Nhân viên sẽ đối chiếu với sao kê ngân hàng.
          </p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={120}
            placeholder="Ghi chú giúp nhân viên tìm nhanh (giờ chuyển, ngân hàng gửi...) - không bắt buộc"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 bg-white"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reportPaid}
              disabled={step === "sending"}
              className="flex-1 bg-brand-blue text-white font-bold rounded-lg py-2 text-sm disabled:opacity-60"
            >
              {step === "sending" ? "Đang gửi..." : "Đúng, tôi đã chuyển"}
            </button>
            <button
              type="button"
              onClick={() => setStep("idle")}
              disabled={step === "sending"}
              className="px-4 border border-slate-200 text-slate-600 font-semibold rounded-lg text-sm bg-white"
            >
              Chưa
            </button>
          </div>
        </div>
      )}
      {reportError && <p className="text-xs text-brand-red text-center">{reportError}</p>}

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

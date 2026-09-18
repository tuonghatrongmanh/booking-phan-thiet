"use client";

import { useState } from "react";
import Image from "next/image";
import { BANK_OPTIONS, buildVietQrImageUrl } from "@/lib/vietqr";
import type { PaymentSettingsData } from "@/lib/payment-settings";

export default function PaymentSettingsForm({ initial }: { initial: PaymentSettingsData }) {
  const [bankBin, setBankBin] = useState(initial.bankBin ?? "");
  const [accountNumber, setAccountNumber] = useState(initial.bankAccountNumber ?? "");
  const [accountName, setAccountName] = useState(initial.bankAccountName ?? "");
  const [deposit, setDeposit] = useState(String(initial.depositAmountVnd));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const depositNumber = Number(deposit.replace(/\D/g, "")) || 0;
  const canPreview = Boolean(bankBin && accountNumber.trim() && accountName.trim() && depositNumber > 0);
  const previewUrl = canPreview
    ? buildVietQrImageUrl({
        bankBin,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        amount: depositNumber,
        message: "BPTXEMTHU",
      })
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/payment-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bankBin,
        bankAccountNumber: accountNumber.trim(),
        bankAccountName: accountName.trim(),
        depositAmountVnd: depositNumber,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setMessage({ type: "error", text: typeof data.error === "string" ? data.error : "Có lỗi xảy ra, vui lòng thử lại." });
      return;
    }
    setMessage({ type: "success", text: "Đã lưu thông tin nhận cọc." });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-2xl">
      <div>
        <h2 className="font-display font-bold text-lg text-slate-800">Thanh toán đặt cọc (VietQR)</h2>
        <p className="text-xs text-slate-400 mt-1">
          Tài khoản ngân hàng nhận tiền cọc khi khách đặt phòng/thuê xe. Khách quét mã QR bằng app ngân hàng bất kỳ
          (Techcombank, MB, Vietcombank...) hoặc Momo để chuyển khoản. Chưa điền thì đơn đặt vẫn nhận bình thường nhưng
          không có bước đặt cọc.
        </p>
      </div>

      <div>
        <label htmlFor="pay-bank" className="text-[13px] text-slate-500 font-medium mb-1 block">Ngân hàng nhận tiền</label>
        <select
          id="pay-bank"
          value={bankBin}
          onChange={(e) => setBankBin(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40 bg-white"
        >
          <option value="">-- Chọn ngân hàng --</option>
          {BANK_OPTIONS.map((b) => (
            <option key={b.bin} value={b.bin}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pay-acc" className="text-[13px] text-slate-500 font-medium mb-1 block">Số tài khoản</label>
          <input
            id="pay-acc"
            inputMode="numeric"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="VD: 19031234567890"
          />
        </div>
        <div>
          <label htmlFor="pay-name" className="text-[13px] text-slate-500 font-medium mb-1 block">Tên chủ tài khoản</label>
          <input
            id="pay-name"
            value={accountName}
            onChange={(e) =>
              setAccountName(
                e.target.value
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/đ/gi, "d")
                  .toUpperCase()
              )
            }
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="NGUYEN VAN A (không dấu, viết hoa)"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pay-deposit" className="text-[13px] text-slate-500 font-medium mb-1 block">Tiền cọc mặc định (VNĐ)</label>
        <input
          id="pay-deposit"
          inputMode="numeric"
          value={deposit}
          onChange={(e) => setDeposit(e.target.value.replace(/\D/g, ""))}
          className="w-full sm:w-64 border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Chỉ là mức dự phòng khi xe / chỗ ở chưa tự đặt tiền cọc riêng. Cọc thật được đặt ngay trong form sửa từng xe (cọc mỗi
          xe, nhân với số xe khách thuê) và từng gói phòng của homestay (phòng đơn, phòng đôi, nguyên căn...).
        </p>
      </div>

      {previewUrl && (
        <div className="bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <Image src={previewUrl} alt="QR xem thử" width={160} height={160} unoptimized className="rounded-lg bg-white" />
          <p className="text-xs text-slate-500">
            Đây là mã QR xem thử (nội dung chuyển khoản: BPTXEMTHU). Hãy tự quét thử bằng app ngân hàng để chắc chắn
            đúng tài khoản trước khi lưu — mã thật của mỗi đơn sẽ có mã tham chiếu riêng.
          </p>
        </div>
      )}

      {message && (
        <p
          className={`text-sm rounded-lg px-3 py-2 ${
            message.type === "success" ? "bg-brand-greenBg text-brand-green" : "bg-brand-redBg text-brand-red"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !canPreview}
        className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
      >
        {saving ? "Đang lưu..." : "Lưu thông tin nhận cọc"}
      </button>
    </form>
  );
}

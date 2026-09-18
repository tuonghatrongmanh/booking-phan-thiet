// Tạo QR chuyển khoản ngân hàng theo chuẩn VietQR (NAPAS - liên ngân hàng quốc gia).
// Dùng dịch vụ ảnh công khai, miễn phí của vietqr.io - KHÔNG cần đăng ký tài khoản/
// API key nào, chỉ cần BIN ngân hàng + số tài khoản (do admin tự nhập ở Cài đặt).
// Khách hàng quét bằng BẤT KỲ app ngân hàng nào (Techcombank, MB, Vietcombank...)
// hoặc app Momo (cũng quét được QR chuyển khoản ngân hàng chuẩn NAPAS này).

import { randomInt } from "crypto";

export const BANK_OPTIONS: { bin: string; label: string }[] = [
  { bin: "970436", label: "Vietcombank" },
  { bin: "970407", label: "Techcombank" },
  { bin: "970418", label: "BIDV" },
  { bin: "970422", label: "MB Bank (Quân Đội)" },
  { bin: "970416", label: "ACB" },
  { bin: "970415", label: "VietinBank" },
  { bin: "970405", label: "Agribank" },
  { bin: "970403", label: "Sacombank" },
  { bin: "970423", label: "TPBank" },
  { bin: "970432", label: "VPBank" },
  { bin: "970437", label: "HDBank" },
  { bin: "970443", label: "SHB" },
  { bin: "970426", label: "MSB" },
  { bin: "970448", label: "OCB" },
];

export function bankLabelForBin(bin: string): string {
  return BANK_OPTIONS.find((b) => b.bin === bin)?.label ?? bin;
}

export function buildVietQrImageUrl(params: {
  bankBin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  message: string;
}): string {
  const { bankBin, accountNumber, accountName, amount, message } = params;
  const base = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png`;
  const query = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo: message,
    accountName,
  });
  return `${base}?${query.toString()}`;
}

// Mã tham chiếu duy nhất để đưa vào nội dung chuyển khoản - admin đối chiếu tay
// bằng cách tìm mã này trong lịch sử giao dịch ngân hàng của họ.
export function generateDepositRef(): string {
  // Bỏ I/O/0/1 để khách đọc/gõ nội dung chuyển khoản không bị nhầm
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 6; i++) random += alphabet[randomInt(alphabet.length)];
  return `BPT${random}`;
}

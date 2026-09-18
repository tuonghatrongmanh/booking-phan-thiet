import { sendMail } from "@/lib/mailer";
import { sendTelegramAlert } from "@/lib/telegram-alert";
import { SITE_URL } from "@/lib/site-url";

// Thông báo cho 2 phía khi có đơn đặt phòng/thuê xe:
//  - ADMIN: Telegram (nếu đã cấu hình) + chuông thông báo trong /admin (tính trực tiếp
//    từ DB, xem /api/admin/notifications)
//  - KHÁCH: email (nếu khách để email VÀ đã cấu hình RESEND_API_KEY) + chuông thông
//    báo trên site (nếu khách đã đăng nhập) + trang tra cứu /tra-cuu-dat-cho.
// Zalo/SMS tự động cần tài khoản doanh nghiệp trả phí (Zalo ZNS / SMS brandname) nên
// chưa làm; thay vào đó admin có nút "Nhắn Zalo"/"Gọi" 1 chạm trong trang quản lý đơn.

export type BookingKind = "stay" | "rental";

export type BookingSummary = {
  kind: BookingKind;
  placeName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  dateText: string; // vd "18/10/2026 → 20/10/2026"
  detailText?: string | null; // vd "Phòng đôi x 2" | "3 xe"
  depositAmount?: number | null;
  depositRef?: string | null;
};

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function vnd(n: number): string {
  return `${n.toLocaleString("vi-VN")}đ`;
}

const KIND_LABEL: Record<BookingKind, string> = { stay: "đặt phòng", rental: "thuê xe" };

export function trackingUrl(ref: string | null | undefined): string {
  return ref ? `${SITE_URL}/tra-cuu-dat-cho?ref=${encodeURIComponent(ref)}` : `${SITE_URL}/tra-cuu-dat-cho`;
}

// ---------- Gửi cho ADMIN ----------

export function notifyAdminNewBooking(b: BookingSummary): void {
  const lines = [
    `🛎 <b>Đơn ${KIND_LABEL[b.kind]} mới</b>`,
    `${esc(b.placeName)}${b.detailText ? ` (${esc(b.detailText)})` : ""}`,
    `Khách: ${esc(b.customerName)} - ${esc(b.customerPhone)}`,
    `Ngày: ${esc(b.dateText)}`,
    b.depositAmount ? `Cọc: ${vnd(b.depositAmount)} - mã CK <code>${esc(b.depositRef ?? "")}</code> (chờ khách chuyển)` : "Chưa yêu cầu cọc",
  ];
  void sendTelegramAlert(lines.join("\n"));
}

export function notifyAdminReportedPaid(b: BookingSummary): void {
  void sendTelegramAlert(
    [
      `💸 <b>Khách báo đã chuyển cọc</b>`,
      `${esc(b.placeName)} - ${esc(b.customerName)} (${esc(b.customerPhone)})`,
      `Số tiền: ${b.depositAmount ? vnd(b.depositAmount) : "?"} - mã CK <code>${esc(b.depositRef ?? "")}</code>`,
      `Hãy kiểm tra app ngân hàng rồi bấm "Xác nhận đã nhận cọc" trong Admin.`,
    ].join("\n")
  );
}

// ---------- Gửi cho KHÁCH (email) ----------

function emailShell(title: string, bodyHtml: string): string {
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:20px;color:#1e293b">
<h2 style="color:#1678C8;margin:0 0 12px">${esc(title)}</h2>
${bodyHtml}
<p style="color:#94a3b8;font-size:12px;margin-top:24px">Booking Phan Thiết - ${esc(SITE_URL.replace(/^https?:\/\//, ""))}</p>
</div>`;
}

function infoTable(b: BookingSummary): string {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${k}</td><td style="padding:4px 0"><b>${v}</b></td></tr>`;
  return `<table style="font-size:14px;margin:12px 0">
${row(b.kind === "stay" ? "Chỗ ở" : "Xe", esc(b.placeName))}
${b.detailText ? row("Chi tiết", esc(b.detailText)) : ""}
${row("Ngày", esc(b.dateText))}
${b.depositAmount ? row("Tiền cọc", vnd(b.depositAmount)) : ""}
${b.depositRef ? row("Mã đơn / nội dung CK", esc(b.depositRef)) : ""}
</table>`;
}

function trackLink(b: BookingSummary): string {
  return `<p><a href="${trackingUrl(b.depositRef)}" style="color:#1678C8">Tra cứu trạng thái đơn</a></p>`;
}

export async function emailBookingReceived(b: BookingSummary) {
  if (!b.customerEmail) return;
  const needDeposit = Boolean(b.depositAmount);
  await sendMail({
    to: b.customerEmail,
    subject: `Đã nhận yêu cầu ${KIND_LABEL[b.kind]} - ${b.placeName}`,
    html: emailShell(
      `Xin chào ${b.customerName}, chúng tôi đã nhận yêu cầu ${KIND_LABEL[b.kind]} của bạn`,
      `${infoTable(b)}${
        needDeposit
          ? `<p>Để giữ chỗ chắc chắn, vui lòng chuyển khoản cọc <b>${vnd(b.depositAmount!)}</b> với đúng nội dung <b>${esc(b.depositRef ?? "")}</b>. Sau khi nhận được cọc chúng tôi sẽ xác nhận và liên hệ bạn.</p>`
          : `<p>Nhân viên sẽ liên hệ số điện thoại của bạn để xác nhận trong thời gian sớm nhất.</p>`
      }${trackLink(b)}`
    ),
  });
}

export async function emailDepositConfirmed(b: BookingSummary) {
  if (!b.customerEmail) return;
  await sendMail({
    to: b.customerEmail,
    subject: `Đã nhận cọc - giữ chỗ thành công (${b.placeName})`,
    html: emailShell(
      `Đã nhận cọc, chỗ của bạn đã được giữ`,
      `<p>Cảm ơn ${esc(b.customerName)}! Chúng tôi đã nhận được tiền cọc và giữ chỗ cho bạn.</p>${infoTable(b)}<p>Nhân viên sẽ liên hệ bạn để chốt chi tiết nhận ${b.kind === "stay" ? "phòng" : "xe"}.</p>${trackLink(b)}`
    ),
  });
}

export async function emailBookingCancelled(b: BookingSummary) {
  if (!b.customerEmail) return;
  await sendMail({
    to: b.customerEmail,
    subject: `Đơn ${KIND_LABEL[b.kind]} đã được huỷ - ${b.placeName}`,
    html: emailShell(
      `Đơn ${KIND_LABEL[b.kind]} của bạn đã được huỷ`,
      `${infoTable(b)}<p>Nếu bạn đã chuyển cọc hoặc cần hỗ trợ, vui lòng liên hệ trực tiếp để được xử lý.</p>${trackLink(b)}`
    ),
  });
}

// dd/mm/yyyy theo UTC - ngày đặt được lưu là 00:00 UTC của ngày khách chọn nên dùng
// UTC để không bị lệch ngày do múi giờ server.
export function formatBookingDate(d: Date): string {
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

// Tin nhắn mẫu để admin dán vào Zalo/SMS gửi khách (Zalo/SMS tự động cần tài khoản
// doanh nghiệp trả phí nên chưa làm - xem src/lib/booking-notify.ts). Admin bấm
// "Nhắn Zalo" mở đúng cuộc trò chuyện, rồi dán tin đã sao chép sẵn.

export function buildCustomerMessage(p: {
  customerName: string;
  placeName: string;
  dateText: string;
  detailText?: string | null;
  depositStatus: "NONE" | "PENDING" | "PAID";
  depositAmount: number | null;
  depositRef: string | null;
  cancelled: boolean;
}): string {
  const what = `${p.placeName}${p.detailText ? ` (${p.detailText})` : ""}, ngày ${p.dateText}`;
  const amount = p.depositAmount ? `${p.depositAmount.toLocaleString("vi-VN")}đ` : "";

  if (p.cancelled) {
    return `Chào ${p.customerName}, đơn đặt ${what} đã được huỷ. Nếu cần hỗ trợ bạn nhắn lại giúp mình nhé.`;
  }
  if (p.depositStatus === "PAID") {
    return `Chào ${p.customerName}, Booking Phan Thiết đã nhận cọc ${amount} cho ${what}. Mã đơn ${p.depositRef ?? ""}. Chỗ của bạn đã được giữ, mình sẽ liên hệ chốt chi tiết. Cảm ơn bạn!`;
  }
  if (p.depositStatus === "PENDING") {
    return `Chào ${p.customerName}, bạn đã đặt ${what}. Để giữ chỗ chắc chắn, bạn vui lòng chuyển khoản cọc ${amount} với nội dung ${p.depositRef ?? ""} nhé. Cảm ơn bạn!`;
  }
  return `Chào ${p.customerName}, Booking Phan Thiết đã nhận yêu cầu đặt ${what}. Mình sẽ liên hệ xác nhận với bạn ngay ạ.`;
}

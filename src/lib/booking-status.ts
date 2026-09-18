// Quy tắc dùng chung về trạng thái đặt cọc (cả server lẫn giao diện).

// Đơn "chờ chuyển khoản" quá số giờ này thì coi là quá hạn cọc (chỉ để admin dễ nhìn và
// khách biết cần đặt lại - đơn chưa cọc vốn không chặn ngày của ai).
export const DEPOSIT_HOLD_HOURS = 24;

// Khách bấm "Tôi đã chuyển khoản" tối đa bấy nhiêu lần / đơn, cách nhau ít nhất bấy
// nhiêu phút sau khi admin trả lời "chưa nhận được tiền" - chống bấm bừa làm phiền admin.
export const MAX_PAYMENT_CLAIMS = 3;
export const CLAIM_COOLDOWN_MS = 5 * 60_000;

export function isDepositExpired(createdAt: Date | string, nowMs: number = Date.now()): boolean {
  return nowMs - new Date(createdAt).getTime() > DEPOSIT_HOLD_HOURS * 60 * 60 * 1000;
}

export type ClaimRecord = {
  paymentClaimCount: number;
  customerReportedPaidAt: Date | null;
  paymentClaimRejectedAt: Date | null;
};

export type ClaimCheck = { ok: true } | { ok: false; reason: string };

export function checkCanReportPaid(r: ClaimRecord, nowMs: number = Date.now()): ClaimCheck {
  if (r.customerReportedPaidAt) {
    return { ok: false, reason: "Bạn đã báo rồi, nhân viên đang kiểm tra ngân hàng. Vui lòng chờ." };
  }
  if (r.paymentClaimCount >= MAX_PAYMENT_CLAIMS) {
    return {
      ok: false,
      reason: "Bạn đã báo quá số lần cho phép. Vui lòng liên hệ trực tiếp nhân viên qua điện thoại/Zalo để được kiểm tra.",
    };
  }
  if (r.paymentClaimRejectedAt) {
    const waitMs = CLAIM_COOLDOWN_MS - (nowMs - r.paymentClaimRejectedAt.getTime());
    if (waitMs > 0) {
      return { ok: false, reason: `Vui lòng đợi ${Math.ceil(waitMs / 60_000)} phút rồi báo lại (hoặc liên hệ nhân viên).` };
    }
  }
  return { ok: true };
}

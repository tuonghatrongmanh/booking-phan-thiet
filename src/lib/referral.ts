import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DEFAULT_COMMISSION_PERCENT, REF_COOKIE, computeCommission, generateReferralCode, normalizeRefCode } from "@/lib/referral-utils";

// Mã giới thiệu + hoa hồng Sale. Quy tắc: khách vào bằng link ?ref=MA (lưu cookie 30 ngày) -> đơn đặt phòng/thuê xe
// gắn Sale đó -> khi admin XÁC NHẬN đã nhận cọc thì tạo hoa hồng (mặc định 5% tiền cọc), trả thủ công.

export type BookingKind = "stay" | "rental";

// Sale bị cấm / đang bị đình chỉ thì không nhận hoa hồng mới
async function isSaleEligible(placeId: string): Promise<boolean> {
  const s = await prisma.saleStanding.findUnique({ where: { placeId }, select: { action: true, active: true, suspendedUntil: true } });
  if (!s || !s.active) return true;
  if (s.action === "BANNED") return false;
  return Boolean(s.suspendedUntil && s.suspendedUntil.getTime() < Date.now());
}

export async function getCommissionPercent(): Promise<number> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { saleCommissionPercent: true } }).catch(() => null);
  return row?.saleCommissionPercent ?? DEFAULT_COMMISSION_PERCENT;
}

// Mã của Sale (tạo lần đầu khi cần, thử lại nếu trùng)
export async function ensureReferralCode(placeId: string): Promise<string> {
  const existing = await prisma.place.findUnique({ where: { id: placeId }, select: { referralCode: true } });
  if (existing?.referralCode) return existing.referralCode;
  for (let i = 0; i < 6; i++) {
    const code = generateReferralCode();
    try {
      const p = await prisma.place.update({ where: { id: placeId }, data: { referralCode: code }, select: { referralCode: true } });
      return p.referralCode!;
    } catch {
      // trùng mã (unique) -> thử mã khác
    }
  }
  throw new Error("Không tạo được mã giới thiệu");
}

// Đọc cookie giới thiệu của request hiện tại -> id Place của Sale hợp lệ (hoặc null). Không tự giới thiệu chính mình.
export async function resolveReferral(bookerUserId?: string): Promise<string | null> {
  const code = normalizeRefCode((await cookies()).get(REF_COOKIE)?.value);
  if (!code) return null;
  const sale = await prisma.place.findFirst({ where: { referralCode: code, category: "SALE", hidden: false }, select: { id: true, userId: true } });
  if (!sale) return null;
  if (bookerUserId && sale.userId === bookerUserId) return null;
  return sale.id;
}

// Gọi sau khi admin xác nhận nhận cọc. Idempotent: mỗi đơn tối đa 1 hoa hồng.
export async function recordCommission(kind: BookingKind, inquiryId: string): Promise<void> {
  try {
    const inq = kind === "stay"
      ? await prisma.stayBookingInquiry.findUnique({ where: { id: inquiryId }, select: { referralSalePlaceId: true, depositAmount: true, depositStatus: true, status: true } })
      : await prisma.rentalInquiry.findUnique({ where: { id: inquiryId }, select: { referralSalePlaceId: true, depositAmount: true, depositStatus: true, status: true } });
    if (!inq?.referralSalePlaceId || inq.depositStatus !== "PAID" || inq.status === "CANCELLED" || !inq.depositAmount) return;
    if (!(await isSaleEligible(inq.referralSalePlaceId))) return;
    const percent = await getCommissionPercent();
    const amount = computeCommission(inq.depositAmount, percent);
    if (amount <= 0) return;
    await prisma.saleCommission.upsert({
      where: { kind_inquiryId: { kind, inquiryId } },
      create: { salePlaceId: inq.referralSalePlaceId, kind, inquiryId, depositAmount: inq.depositAmount, ratePercent: percent, amount },
      update: {},
    });
  } catch (err) {
    console.error("[referral] Không ghi được hoa hồng:", err);
  }
}

// Đơn bị hủy trước khi trả hoa hồng -> hủy luôn hoa hồng (đã trả rồi thì giữ nguyên để admin tự xử lý)
export async function voidCommission(kind: BookingKind, inquiryId: string): Promise<void> {
  await prisma.saleCommission.updateMany({ where: { kind, inquiryId, status: "PENDING" }, data: { status: "CANCELLED" } }).catch(() => {});
}

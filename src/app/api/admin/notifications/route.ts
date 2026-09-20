import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { findReviewBursts } from "@/lib/review-guard";

// GET /api/admin/notifications - gop cac su kien that gan day thanh 1 danh sach thong
// bao (canh bao bao mat, thanh vien moi, binh luan moi). Khong luu trang thai da
// doc/chua doc trong DB (chua co bang rieng) - client tu theo doi qua localStorage
// bang cach so sanh id/thoi gian moi nhat da xem.
export async function GET() {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const adminId = (session!.user as { id: string }).id;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [alerts, newUsers, newComments, unreadMessages, reviewBursts, newRentals, newStays, reportedRentals, reportedStays] =
    await Promise.all([
    prisma.requestLog.findMany({
      where: { suspicious: true, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, ip: true, reason: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.forumComment.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, createdAt: true, author: { select: { name: true } } },
    }),
    prisma.adminMessage.findMany({
      where: { toAdminId: adminId, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, message: true, createdAt: true, fromAdmin: { select: { name: true } } },
    }),
    findReviewBursts(),
    prisma.rentalInquiry.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, customerName: true, quantity: true, createdAt: true, place: { select: { name: true } } },
    }),
    prisma.stayBookingInquiry.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, customerName: true, optionLabel: true, createdAt: true, place: { select: { name: true } } },
    }),
    // Khách bấm "Tôi đã chuyển khoản" nhưng admin chưa xác nhận - hiện cho tới khi xử lý xong
    prisma.rentalInquiry.findMany({
      where: { depositStatus: "PENDING", status: { not: "CANCELLED" }, customerReportedPaidAt: { not: null } },
      orderBy: { customerReportedPaidAt: "desc" },
      take: 5,
      select: { id: true, customerName: true, depositAmount: true, customerReportedPaidAt: true, place: { select: { name: true } } },
    }),
    prisma.stayBookingInquiry.findMany({
      where: { depositStatus: "PENDING", status: { not: "CANCELLED" }, customerReportedPaidAt: { not: null } },
      orderBy: { customerReportedPaidAt: "desc" },
      take: 5,
      select: { id: true, customerName: true, depositAmount: true, customerReportedPaidAt: true, place: { select: { name: true } } },
    }),
  ]);

  const paidItem = (
    kind: "rental" | "stay",
    r: { id: string; customerName: string; depositAmount: number | null; customerReportedPaidAt: Date | null; place: { name: string } }
  ) => ({
    id: `reported-paid-${kind}-${r.id}`,
    type: "warning" as const,
    title: "Khách báo đã chuyển cọc - hãy kiểm tra ngân hàng",
    description: `${r.customerName} - ${r.place.name}${r.depositAmount ? " - " + r.depositAmount.toLocaleString("vi-VN") + "đ" : ""}`,
    href: kind === "rental" ? "/admin/rental-inquiries" : "/admin/stay-booking-inquiries",
    createdAt: r.customerReportedPaidAt ?? new Date(0),
  });

  const isSuper = (session!.user as { role?: string }).role === "SUPER_ADMIN";
  const partnerReqs = isSuper
    ? await prisma.placeChangeRequest.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, createdAt: true, place: { select: { name: true } } } })
    : [];

  const items = [
    ...partnerReqs.map((r) => ({
      id: `partner-req-${r.id}`,
      type: "important" as const,
      title: "Đối tác gửi yêu cầu chỉnh sửa",
      description: r.place.name,
      href: "/admin/yeu-cau-doi-tac",
      createdAt: r.createdAt,
    })),
    ...reportedRentals.map((r) => paidItem("rental", r)),
    ...reportedStays.map((r) => paidItem("stay", r)),
    ...newRentals.map((r) => ({
      id: `rental-new-${r.id}`,
      type: "unread" as const,
      title: "Có đơn thuê xe mới",
      description: `${r.customerName} - ${r.place.name}${r.quantity > 1 ? " (" + r.quantity + " xe)" : ""}`,
      href: "/admin/rental-inquiries",
      createdAt: r.createdAt,
    })),
    ...newStays.map((r) => ({
      id: `stay-new-${r.id}`,
      type: "unread" as const,
      title: "Có đơn đặt phòng mới",
      description: `${r.customerName} - ${r.place.name}${r.optionLabel ? " (" + r.optionLabel + ")" : ""}`,
      href: "/admin/stay-booking-inquiries",
      createdAt: r.createdAt,
    })),
    ...reviewBursts.map((b) => ({
      id: `review-burst-${b.kind}-${b.targetId}`,
      type: "warning" as const,
      title: "Nghi bão đánh giá xấu",
      description: `"${b.name}" nhận ${b.count} đánh giá ≤2★ trong 24 giờ`,
      href: "/admin/user-reviews",
      createdAt: b.latestAt,
    })),
    ...alerts.map((a) => ({
      id: `alert-${a.id}`,
      type: "warning" as const,
      title: "Có cảnh báo bảo mật mới",
      description: `IP ${a.ip} — ${a.reason}`,
      href: "/admin",
      createdAt: a.createdAt,
    })),
    ...newUsers.map((u) => ({
      id: `user-${u.id}`,
      type: "system" as const,
      title: `${u.name} vừa đăng ký`,
      description: "Thành viên mới tham gia hệ thống",
      href: "/admin/users",
      createdAt: u.createdAt,
    })),
    ...newComments.map((c) => ({
      id: `comment-${c.id}`,
      type: "unread" as const,
      title: "Có bình luận mới",
      description: `${c.author.name} vừa bình luận trên diễn đàn`,
      href: "/admin/forum-comments",
      createdAt: c.createdAt,
    })),
    ...unreadMessages.map((m) => ({
      id: `message-${m.id}`,
      type: "message" as const,
      title: `Tin nhắn từ ${m.fromAdmin.name}`,
      description: m.message,
      href: "/admin/messages",
      createdAt: m.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return NextResponse.json({ items: items.slice(0, 15) });
}

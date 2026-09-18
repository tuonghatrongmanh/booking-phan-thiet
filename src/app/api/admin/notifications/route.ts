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

  const [alerts, newUsers, newComments, unreadMessages, reviewBursts] = await Promise.all([
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
  ]);

  const items = [
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

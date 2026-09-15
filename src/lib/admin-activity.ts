import { prisma } from "@/lib/prisma";

export type ActivityItem = {
  id: string;
  type: "POST_CREATED" | "USER_REGISTERED" | "LOCATION_UPDATED" | "COMMENT_CREATED" | "SALE_STARTED" | "REVIEW_CREATED";
  title: string;
  description: string;
  timestamp: Date;
  href: string;
};

const TYPE_ICON: Record<ActivityItem["type"], string> = {
  POST_CREATED: "fa-solid fa-newspaper",
  USER_REGISTERED: "fa-solid fa-user-plus",
  LOCATION_UPDATED: "fa-solid fa-location-dot",
  COMMENT_CREATED: "fa-solid fa-comment",
  SALE_STARTED: "fa-solid fa-tag",
  REVIEW_CREATED: "fa-solid fa-star",
};

const TYPE_COLOR: Record<ActivityItem["type"], string> = {
  POST_CREATED: "text-brand-blue bg-sky-50",
  USER_REGISTERED: "text-brand-green bg-brand-greenBg",
  LOCATION_UPDATED: "text-brand-orange bg-amber-50",
  COMMENT_CREATED: "text-brand-purple bg-brand-purpleBg",
  SALE_STARTED: "text-brand-gold bg-amber-50",
  REVIEW_CREATED: "text-brand-purple bg-brand-purpleBg",
};

export { TYPE_ICON, TYPE_COLOR };

// Gop hoat dong that tu 6 nguon du lieu khac nhau thanh 1 dong thoi gian - dung
// truc tiep server-side trong trang dashboard (khong can API rieng vi day la SSR).
export async function getRecentActivity(limit = 8): Promise<ActivityItem[]> {
  const [news, users, places, comments, sales, reviews] = await Promise.all([
    prisma.news.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, createdAt: true } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, createdAt: true } }),
    prisma.place.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, name: true, updatedAt: true } }),
    prisma.forumComment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, createdAt: true, author: { select: { name: true } }, postId: true },
    }),
    prisma.sale.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, createdAt: true } }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, reviewerName: true, createdAt: true, placeId: true },
    }),
  ]);

  const items: ActivityItem[] = [
    ...news.map((n) => ({
      id: `news-${n.id}`,
      type: "POST_CREATED" as const,
      title: "Bài viết mới được đăng",
      description: `Admin đã đăng bài "${n.title}"`,
      timestamp: n.createdAt,
      href: `/admin/news/${n.id}/edit`,
    })),
    ...users.map((u) => ({
      id: `user-${u.id}`,
      type: "USER_REGISTERED" as const,
      title: "Thành viên mới đăng ký",
      description: `${u.name} đã đăng ký tài khoản`,
      timestamp: u.createdAt,
      href: "/admin/users",
    })),
    ...places.map((p) => ({
      id: `place-${p.id}`,
      type: "LOCATION_UPDATED" as const,
      title: "Địa điểm được cập nhật",
      description: `${p.name} đã được cập nhật thông tin`,
      timestamp: p.updatedAt,
      href: `/admin/places/${p.id}`,
    })),
    ...comments.map((c) => ({
      id: `comment-${c.id}`,
      type: "COMMENT_CREATED" as const,
      title: "Bình luận mới",
      description: `${c.author.name} đã bình luận trên diễn đàn`,
      timestamp: c.createdAt,
      href: "/admin/forum-comments",
    })),
    ...sales.map((s) => ({
      id: `sale-${s.id}`,
      type: "SALE_STARTED" as const,
      title: "Sale bắt đầu",
      description: `Chương trình "${s.title}" đã được tạo`,
      timestamp: s.createdAt,
      href: `/admin/sales/${s.id}/edit`,
    })),
    ...reviews.map((r) => ({
      id: `review-${r.id}`,
      type: "REVIEW_CREATED" as const,
      title: "Đánh giá mới",
      description: `${r.reviewerName} vừa để lại đánh giá`,
      timestamp: r.createdAt,
      href: `/admin/reviews/${r.id}/edit`,
    })),
  ];

  return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
}

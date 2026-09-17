import { prisma } from "@/lib/prisma";

export type ActivityItem = {
  id: string;
  icon: string;
  avatar: string;
  name: string;
  action: string;
  createdAt: Date;
};

const STOCK_AVATARS = [
  "/images/avatar_01.png",
  "/images/avatar_02.png",
  "/images/avatar_03.png",
  "/images/avatar_04.png",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

// Che 1 phan ten thuc de bao ve quyen rieng tu khi hien thi cong khai tren widget xa
// hoi (vi du "Nguyen Van An" -> "Nguyen V. A."), van giu duoc cam giac "nguoi thuc".
function maskName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Một khách hàng";
  if (parts.length === 1) return parts[0];
  const rest = parts
    .slice(1)
    .map((p) => `${p[0]?.toUpperCase() ?? ""}.`)
    .join(" ");
  return `${parts[0]} ${rest}`;
}

function relativeMinutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}

// Nguon MINH HOA: admin tu viet toan bo noi dung (xem /admin/activity-samples) - dung
// khi du lieu THAT chua du nhieu de widget luon soi dong. Thoi gian LUON tinh lai la
// "vua moi" moi lan tai trang (khong luu ngay co dinh trong DB) de khong bao gio bi cu.
async function getIllustrativeItems(limit: number): Promise<ActivityItem[]> {
  const samples = await prisma.activitySample.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });

  return samples.map((s, i) => ({
    id: `sample-${s.id}`,
    icon: s.icon,
    avatar: s.avatar || pick(STOCK_AVATARS, i),
    name: s.name,
    action: s.action,
    createdAt: relativeMinutesAgo(1 + ((i * 7) % 45)),
  }));
}

// Nguon THAT: danh gia/trung xu/doi thuong/bai dang dien dan/thanh vien moi - tat ca
// deu la hanh dong thuc su xay ra, gan ten + avatar THAT cua nguoi dung.
async function getRealItems(limit: number): Promise<ActivityItem[]> {
  const [reviews, plays, redemptions, posts, newUsers] = await Promise.all([
    prisma.placeReview.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { name: true, avatar: true } }, place: { select: { name: true } } },
    }),
    prisma.gamePlay.findMany({
      where: { coinsWon: { gt: 0 } },
      orderBy: { playedAt: "desc" },
      take: limit,
      include: { user: { select: { name: true, avatar: true } }, game: { select: { name: true } } },
    }),
    prisma.redemption.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { name: true, avatar: true } }, reward: { select: { name: true } } },
    }),
    prisma.forumPost.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { authorUser: { select: { name: true, avatar: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { name: true, avatar: true, createdAt: true },
    }),
  ]);

  const items: ActivityItem[] = [
    ...reviews.map((r) => ({
      id: `review-${r.id}`,
      icon: "fa-solid fa-star",
      avatar: r.user.avatar || "/images/avatar-world.png",
      name: maskName(r.user.name),
      action: `vừa đánh giá ${r.rating}★ cho ${r.place.name}`,
      createdAt: r.createdAt,
    })),
    ...plays.map((p) => ({
      id: `play-${p.id}`,
      icon: "fa-solid fa-coins",
      avatar: p.user.avatar || "/images/avatar-world.png",
      name: maskName(p.user.name),
      action: `vừa trúng ${p.coinsWon} xu ở ${p.game.name}`,
      createdAt: p.playedAt,
    })),
    ...redemptions.map((rd) => ({
      id: `redeem-${rd.id}`,
      icon: "fa-solid fa-gift",
      avatar: rd.user.avatar || "/images/avatar-world.png",
      name: maskName(rd.user.name),
      action: `vừa đổi "${rd.reward.name}"`,
      createdAt: rd.createdAt,
    })),
    ...posts
      .filter((p) => p.authorUser)
      .map((p) => ({
        id: `post-${p.id}`,
        icon: "fa-solid fa-comment-dots",
        avatar: p.authorUser!.avatar || "/images/avatar-world.png",
        name: maskName(p.authorUser!.name),
        action: `vừa đăng bài trên Cộng đồng Phan Thiết`,
        createdAt: p.createdAt,
      })),
    ...newUsers.map((u, i) => ({
      id: `newuser-${u.createdAt.getTime()}-${i}`,
      icon: "fa-solid fa-user-plus",
      avatar: u.avatar || "/images/avatar-world.png",
      name: maskName(u.name),
      action: `vừa tham gia Booking Phan Thiết`,
      createdAt: u.createdAt,
    })),
  ];

  return items;
}

export async function getRecentActivityFeed(limit = 10): Promise<ActivityItem[]> {
  const [real, illustrative] = await Promise.all([getRealItems(limit), getIllustrativeItems(limit)]);

  const merged = [...real, ...illustrative];
  merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return merged.slice(0, 40);
}

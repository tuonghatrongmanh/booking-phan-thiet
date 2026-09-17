import { prisma } from "@/lib/prisma";

export type ActivityItem = {
  id: string;
  icon: string;
  text: string;
  createdAt: Date;
};

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

// Widget "hoat dong gan day" tren trang chu dung DU LIEU THAT (danh gia/trung
// xu/doi thuong thuc su xay ra) thay vi bia dat ten khach + hanh dong gia - vua
// trung thuc vua khong ton cong admin nhap lieu. Khong co model "Booking" thuc su
// trong he thong (site tra cuu thong tin, khong xu ly dat phong) nen day la nguon
// "hoat dong xa hoi" gan nhat co san.
export async function getRecentActivityFeed(limit = 10): Promise<ActivityItem[]> {
  const [reviews, plays, redemptions] = await Promise.all([
    prisma.placeReview.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { name: true } }, place: { select: { name: true } } },
    }),
    prisma.gamePlay.findMany({
      where: { coinsWon: { gt: 0 } },
      orderBy: { playedAt: "desc" },
      take: limit,
      include: { user: { select: { name: true } }, game: { select: { name: true } } },
    }),
    prisma.redemption.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { name: true } }, reward: { select: { name: true } } },
    }),
  ]);

  const items: ActivityItem[] = [
    ...reviews.map((r) => ({
      id: `review-${r.id}`,
      icon: "fa-solid fa-star",
      text: `${maskName(r.user.name)} vừa đánh giá ${r.rating}★ cho ${r.place.name}`,
      createdAt: r.createdAt,
    })),
    ...plays.map((p) => ({
      id: `play-${p.id}`,
      icon: "fa-solid fa-coins",
      text: `${maskName(p.user.name)} vừa trúng ${p.coinsWon} xu ở ${p.game.name}`,
      createdAt: p.playedAt,
    })),
    ...redemptions.map((rd) => ({
      id: `redeem-${rd.id}`,
      icon: "fa-solid fa-gift",
      text: `${maskName(rd.user.name)} vừa đổi "${rd.reward.name}"`,
      createdAt: rd.createdAt,
    })),
  ];

  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return items.slice(0, limit);
}

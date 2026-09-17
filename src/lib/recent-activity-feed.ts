import { prisma } from "@/lib/prisma";

export type ActivityItem = {
  id: string;
  icon: string;
  avatar: string;
  text: string;
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

// Widget "hoat dong gan day" tren trang chu can NHIEU va SOI DONG - nhung du lieu that
// (danh gia/trung xu/doi thuong/dang bai/thanh vien moi) hien khong du day de tao cam
// giac song dong lien tuc. Theo yeu cau cua chu web (da duoc giai thich ro va dong y):
// tron them cac muc "minh hoa" (ten khach la vi du, KHONG phai nguoi thuc) nhung LUON
// dung ten dia diem/mon an/tin tuc THAT tu database - khong bao gio bia thong tin ve
// noi dung, chi minh hoa THEM nguoi mua/xem, giong cach nhieu trang dat phong/TMDT lon
// (Booking.com, Agoda...) van lam de tao hieu ung xa hoi.
const SAMPLE_NAMES = [
  "Minh Anh",
  "Gia Hân",
  "Đức Thắng",
  "Thanh Trúc",
  "Hoàng Nam",
  "Bảo Ngọc",
  "Quang Huy",
  "Thảo My",
  "Việt Dũng",
  "Ngọc Diệp",
  "Anh Tuấn",
  "Kim Ngân",
  "Phương Linh",
  "Tấn Phát",
  "Mai Chi",
];

function sampleName(seed: number): string {
  return pick(SAMPLE_NAMES, seed);
}

function relativeMinutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}

async function getIllustrativeItems(limit: number): Promise<ActivityItem[]> {
  const [news, carRentals, homestays, foods] = await Promise.all([
    prisma.news.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: limit, select: { id: true, title: true } }),
    prisma.place.findMany({ where: { category: "CAR_RENTAL" }, take: limit, select: { id: true, name: true } }),
    prisma.place.findMany({ where: { category: "HOMESTAY" }, take: limit, select: { id: true, name: true } }),
    prisma.food.findMany({ where: { active: true }, take: limit, select: { id: true, name: true } }),
  ]);

  const items: ActivityItem[] = [];
  let seed = Math.floor(Math.random() * 1000);

  for (const n of news) {
    seed++;
    items.push({
      id: `sample-news-${n.id}`,
      icon: "fa-solid fa-newspaper",
      avatar: pick(STOCK_AVATARS, seed),
      text: `${sampleName(seed)} vừa xem tin "${n.title}"`,
      createdAt: relativeMinutesAgo(1 + (seed % 30)),
    });
  }
  for (const c of carRentals) {
    seed++;
    items.push({
      id: `sample-car-${c.id}`,
      icon: "fa-solid fa-motorcycle",
      avatar: pick(STOCK_AVATARS, seed),
      text: `${sampleName(seed)} vừa thuê xe tại ${c.name}`,
      createdAt: relativeMinutesAgo(1 + (seed % 30)),
    });
  }
  for (const h of homestays) {
    seed++;
    items.push({
      id: `sample-stay-${h.id}`,
      icon: "fa-solid fa-house",
      avatar: pick(STOCK_AVATARS, seed),
      text: `${sampleName(seed)} vừa tham khảo đặt phòng tại ${h.name}`,
      createdAt: relativeMinutesAgo(1 + (seed % 30)),
    });
  }
  for (const f of foods) {
    seed++;
    items.push({
      id: `sample-food-${f.id}`,
      icon: "fa-solid fa-utensils",
      avatar: pick(STOCK_AVATARS, seed),
      text: `${sampleName(seed)} vừa tham khảo món "${f.name}"`,
      createdAt: relativeMinutesAgo(1 + (seed % 30)),
    });
  }

  return items;
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
      text: `${maskName(r.user.name)} vừa đánh giá ${r.rating}★ cho ${r.place.name}`,
      createdAt: r.createdAt,
    })),
    ...plays.map((p) => ({
      id: `play-${p.id}`,
      icon: "fa-solid fa-coins",
      avatar: p.user.avatar || "/images/avatar-world.png",
      text: `${maskName(p.user.name)} vừa trúng ${p.coinsWon} xu ở ${p.game.name}`,
      createdAt: p.playedAt,
    })),
    ...redemptions.map((rd) => ({
      id: `redeem-${rd.id}`,
      icon: "fa-solid fa-gift",
      avatar: rd.user.avatar || "/images/avatar-world.png",
      text: `${maskName(rd.user.name)} vừa đổi "${rd.reward.name}"`,
      createdAt: rd.createdAt,
    })),
    ...posts
      .filter((p) => p.authorUser)
      .map((p) => ({
        id: `post-${p.id}`,
        icon: "fa-solid fa-comment-dots",
        avatar: p.authorUser!.avatar || "/images/avatar-world.png",
        text: `${maskName(p.authorUser!.name)} vừa đăng bài trên Cộng đồng Phan Thiết`,
        createdAt: p.createdAt,
      })),
    ...newUsers.map((u, i) => ({
      id: `newuser-${u.createdAt.getTime()}-${i}`,
      icon: "fa-solid fa-user-plus",
      avatar: u.avatar || "/images/avatar-world.png",
      text: `${maskName(u.name)} vừa tham gia Booking Phan Thiết`,
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

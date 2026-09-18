import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendTelegramAlert } from "@/lib/telegram-alert";

// Chống "bão đánh giá xấu" (review bombing) trên đánh giá của CHÍNH website (Ẩm thực /
// Lưu trú / Điểm tham quan). Không chặn được đánh giá trên Google Maps/Facebook - đó là
// nền tảng khác. Các lớp phòng thủ ở đây:
//  1. Mỗi tài khoản chỉ 1 đánh giá / mục (trước đây 1 người gửi được 300 đánh giá/giờ)
//  2. Trần đánh giá mỗi tài khoản / 24h + trần mỗi IP / giờ (chặn 1 người lập nhiều acc)
//  3. Phát hiện dồn dập: nhiều đánh giá ≤2★ vào 1 mục trong thời gian ngắn -> báo admin
//     (Telegram + chuông thông báo) để vào /admin/user-reviews xóa.

export type ReviewKind = "food" | "place";

const MAX_PER_USER_PER_DAY = 10;
const MAX_PER_IP_PER_HOUR = 15;
export const BURST_THRESHOLD = 4; // số đánh giá ≤2★
export const BURST_WINDOW_MS = 60 * 60 * 1000;

export type ReviewGuardResult = { ok: true } | { ok: false; status: number; error: string };

export async function checkReviewAllowed(params: {
  kind: ReviewKind;
  targetId: string;
  userId: string;
  ip: string;
}): Promise<ReviewGuardResult> {
  const { kind, targetId, userId, ip } = params;

  if (!rateLimit(`review-ip:${ip}`, MAX_PER_IP_PER_HOUR, 60 * 60_000)) {
    return { ok: false, status: 429, error: "Mạng của bạn gửi quá nhiều đánh giá, vui lòng thử lại sau." };
  }

  const existing =
    kind === "food"
      ? await prisma.foodReview.findFirst({ where: { foodId: targetId, userId }, select: { id: true } })
      : await prisma.placeReview.findFirst({ where: { placeId: targetId, userId }, select: { id: true } });
  if (existing) {
    return { ok: false, status: 409, error: "Bạn đã đánh giá mục này rồi. Mỗi tài khoản chỉ được đánh giá một lần." };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [foodCount, placeCount] = await Promise.all([
    prisma.foodReview.count({ where: { userId, createdAt: { gte: since } } }),
    prisma.placeReview.count({ where: { userId, createdAt: { gte: since } } }),
  ]);
  if (foodCount + placeCount >= MAX_PER_USER_PER_DAY) {
    return { ok: false, status: 429, error: "Bạn đã đạt giới hạn số đánh giá trong 24 giờ, vui lòng quay lại sau." };
  }

  return { ok: true };
}

export type ReviewBurst = { kind: ReviewKind; targetId: string; name: string; count: number; latestAt: Date };

// Các mục đang nhận dồn dập đánh giá ≤2★ trong `windowMs` gần nhất (mặc định 24 giờ).
export async function findReviewBursts(windowMs: number = 24 * 60 * 60 * 1000): Promise<ReviewBurst[]> {
  const since = new Date(Date.now() - windowMs);
  const [foodGroups, placeGroups] = await Promise.all([
    prisma.foodReview.groupBy({
      by: ["foodId"],
      where: { rating: { lte: 2 }, createdAt: { gte: since } },
      _count: { _all: true },
      _max: { createdAt: true },
      having: { foodId: { _count: { gte: BURST_THRESHOLD } } },
    }),
    prisma.placeReview.groupBy({
      by: ["placeId"],
      where: { rating: { lte: 2 }, createdAt: { gte: since } },
      _count: { _all: true },
      _max: { createdAt: true },
      having: { placeId: { _count: { gte: BURST_THRESHOLD } } },
    }),
  ]);

  const [foods, places] = await Promise.all([
    prisma.food.findMany({ where: { id: { in: foodGroups.map((g) => g.foodId) } }, select: { id: true, name: true } }),
    prisma.place.findMany({ where: { id: { in: placeGroups.map((g) => g.placeId) } }, select: { id: true, name: true } }),
  ]);

  return [
    ...foodGroups.map((g) => ({
      kind: "food" as const,
      targetId: g.foodId,
      name: foods.find((f) => f.id === g.foodId)?.name ?? g.foodId,
      count: g._count._all,
      latestAt: g._max.createdAt ?? new Date(0),
    })),
    ...placeGroups.map((g) => ({
      kind: "place" as const,
      targetId: g.placeId,
      name: places.find((p) => p.id === g.placeId)?.name ?? g.placeId,
      count: g._count._all,
      latestAt: g._max.createdAt ?? new Date(0),
    })),
  ];
}

// Gọi sau khi tạo 1 đánh giá ≤2★: nếu mục đó vừa vượt ngưỡng dồn dập thì báo admin qua
// Telegram (tối đa 1 lần / 6 giờ / mục để không spam).
export async function alertIfReviewBurst(kind: ReviewKind, targetId: string, rating: number): Promise<void> {
  if (rating > 2) return;
  try {
    const since = new Date(Date.now() - BURST_WINDOW_MS);
    const count =
      kind === "food"
        ? await prisma.foodReview.count({ where: { foodId: targetId, rating: { lte: 2 }, createdAt: { gte: since } } })
        : await prisma.placeReview.count({ where: { placeId: targetId, rating: { lte: 2 }, createdAt: { gte: since } } });
    if (count < BURST_THRESHOLD) return;
    if (!rateLimit(`review-burst-alert:${kind}:${targetId}`, 1, 6 * 60 * 60_000)) return;

    const name =
      kind === "food"
        ? (await prisma.food.findUnique({ where: { id: targetId }, select: { name: true } }))?.name
        : (await prisma.place.findUnique({ where: { id: targetId }, select: { name: true } }))?.name;
    await sendTelegramAlert(
      `⚠️ <b>Nghi bão đánh giá xấu</b>\n"${name ?? targetId}" vừa nhận ${count} đánh giá ≤2★ trong 1 giờ.\nVào Admin → Kiểm duyệt đánh giá để xem và xóa nếu là spam.`
    );
  } catch (err) {
    console.error("[review-guard] kiểm tra dồn dập thất bại:", err);
  }
}

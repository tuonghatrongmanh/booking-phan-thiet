import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { rateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

class RedeemError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const checkoutSchema = z.object({
  recipientName: z.string().trim().min(2, "Vui lòng nhập họ tên").max(100),
  recipientPhone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
  addressText: z.string().trim().min(5, "Vui lòng nhập địa chỉ nhận hàng").max(300),
  addressLat: z.number().optional().nullable(),
  addressLng: z.number().optional().nullable(),
});

// Doi thuong bang xu - dung updateMany co dieu kien (coins/stock du) trong 1
// transaction de tranh race condition (2 request doi cung luc khong the cung lam
// stock/xu am). Redemption tao ra o trang PENDING - admin xu ly thu cong (khong co
// cong giao hang/voucher tu dong, giong cach site nay van lam voi cac thu khac).
// Nay yeu cau them thong tin nguoi nhan (ho ten/sdt/dia chi) giong luong checkout
// TikTok - thu thap ngay luc doi de admin co du thong tin giao thuong.
export async function POST(req: NextRequest, { params }: Params) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập để đổi thưởng" }, { status: 401 });
  }

  if (!rateLimit(`redeem:${actor.id}`, 5, 10_000)) {
    return NextResponse.json({ error: "Bạn đang thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Thông tin không hợp lệ" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const redemption = await prisma.$transaction(async (tx) => {
      const reward = await tx.rewardItem.findUnique({ where: { id } });
      if (!reward || !reward.active) throw new RedeemError("Phần thưởng không còn khả dụng", 404);

      if (reward.stock !== null) {
        const stockUpdate = await tx.rewardItem.updateMany({
          where: { id: reward.id, stock: { gt: 0 } },
          data: { stock: { decrement: 1 } },
        });
        if (stockUpdate.count === 0) throw new RedeemError("Phần thưởng đã hết", 409);
      }

      const coinUpdate = await tx.user.updateMany({
        where: { id: actor.id, coins: { gte: reward.coinCost } },
        data: { coins: { decrement: reward.coinCost } },
      });
      if (coinUpdate.count === 0) throw new RedeemError("Bạn không đủ xu để đổi phần thưởng này", 400);

      return tx.redemption.create({
        data: {
          userId: actor.id,
          rewardId: reward.id,
          coinsSpent: reward.coinCost,
          recipientName: parsed.data.recipientName,
          recipientPhone: parsed.data.recipientPhone,
          addressText: parsed.data.addressText,
          addressLat: parsed.data.addressLat ?? null,
          addressLng: parsed.data.addressLng ?? null,
        },
        include: { reward: true },
      });
    });

    const user = await prisma.user.findUnique({ where: { id: actor.id }, select: { coins: true } });
    return NextResponse.json({ redemption, newBalance: user?.coins ?? 0 }, { status: 201 });
  } catch (err) {
    if (err instanceof RedeemError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { rateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ slug: string }> };

// Choi 1 luot game - MOI THU QUYET DINH O SERVER (khong tin bat ky gia tri gi tu
// client): so xu thuong duoc random trong [coinMin, coinMax] cua Game, va gioi han
// so luot/ngay duoc kiem tra bang cach DEM lai cac ban ghi GamePlay thuc te trong DB
// (khong dung bo dem rieng de tranh bi lech/gian lan bang cach goi API khac de reset).
export async function POST(req: NextRequest, { params }: Params) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập để chơi game" }, { status: 401 });
  }

  if (!rateLimit(`game-play:${actor.id}`, 5, 10_000)) {
    return NextResponse.json({ error: "Bạn đang thao tác quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const { slug } = await params;
  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game || !game.active || game.comingSoon) {
    return NextResponse.json({ error: "Game chưa sẵn sàng để chơi" }, { status: 404 });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const playsToday = await prisma.gamePlay.count({
    where: { userId: actor.id, gameId: game.id, playedAt: { gte: startOfDay } },
  });

  if (playsToday >= game.dailyLimit) {
    return NextResponse.json(
      { error: "Bạn đã dùng hết lượt chơi miễn phí hôm nay, quay lại vào ngày mai nhé!" },
      { status: 429 }
    );
  }

  const coinsWon = Math.floor(Math.random() * (game.coinMax - game.coinMin + 1)) + game.coinMin;

  const [, user] = await prisma.$transaction([
    prisma.gamePlay.create({ data: { gameId: game.id, userId: actor.id, coinsWon } }),
    prisma.user.update({ where: { id: actor.id }, data: { coins: { increment: coinsWon } } }),
  ]);

  return NextResponse.json({ coinsWon, newBalance: user.coins, playsLeftToday: game.dailyLimit - playsToday - 1 });
}

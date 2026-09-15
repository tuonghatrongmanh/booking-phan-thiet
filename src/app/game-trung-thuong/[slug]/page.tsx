import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import WheelGame from "@/components/game/WheelGame";
import FishingGame from "@/components/game/FishingGame";
import PuzzleSwapGame from "@/components/game/PuzzleSwapGame";
import MemoryMatchGame from "@/components/game/MemoryMatchGame";
import ClickCollectGame from "@/components/game/ClickCollectGame";

const PLAYABLE_SLUGS = ["vong-quay-may-man", "cau-ca-doi-xu", "ghep-hinh-du-lich", "tim-cap-hinh-anh", "click-nhan-xu"];

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game) return {};
  return { title: `${game.name} - Game trúng thưởng | Booking Phan Thiết`, description: game.description };
}

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game || !game.active) notFound();

  if (game.comingSoon) {
    return (
      <>
        <Header />
        <section className="container-custom py-20 text-center">
          <span className="w-20 h-20 rounded-full bg-brand-sky text-brand-blue flex items-center justify-center text-3xl mx-auto mb-5">
            <i className={game.icon} aria-hidden="true" />
          </span>
          <h1 className="font-display font-bold text-2xl text-slate-800 mb-2">{game.name}</h1>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">{game.description}</p>
          <p className="text-amber-600 font-bold bg-amber-50 inline-block px-4 py-2 rounded-full text-sm mb-6">
            Game này sắp ra mắt, quay lại sau nhé!
          </p>
          <br />
          <Link href="/game-trung-thuong" className="text-brand-blue font-bold hover:underline">
            ← Quay lại danh sách game
          </Link>
        </section>
        <Footer />
      </>
    );
  }

  const actor = await getActor();
  const isUser = actor?.type === "user";

  if (!PLAYABLE_SLUGS.includes(game.slug)) {
    // Game chua co logic choi rieng (dang xay dung) - tranh 500 loi.
    notFound();
  }

  if (!isUser) {
    return (
      <>
        <Header />
        <section className="container-custom py-20 text-center">
          <h1 className="font-display font-bold text-2xl text-slate-800 mb-3">{game.name}</h1>
          <p className="text-slate-500 mb-6">Bạn cần đăng nhập để chơi game và tích xu.</p>
          <Link
            href={`/dang-nhap?callbackUrl=/game-trung-thuong/${game.slug}`}
            className="inline-block bg-brand-blue text-white font-bold rounded-full px-6 py-3 hover:brightness-95 transition"
          >
            Đăng nhập ngay
          </Link>
        </section>
        <Footer />
      </>
    );
  }

  const [user, startOfDayCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: actor!.id }, select: { coins: true } }),
    (async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return prisma.gamePlay.count({ where: { userId: actor!.id, gameId: game.id, playedAt: { gte: startOfDay } } });
    })(),
  ]);

  const common = {
    slug: game.slug,
    gameName: game.name,
    dailyLimit: game.dailyLimit,
    initialBalance: user?.coins ?? 0,
    alreadyPlayedToday: startOfDayCount >= game.dailyLimit,
  };

  return (
    <>
      <Header />
      <section className="container-custom py-12">
        <h1 className="font-display font-bold text-2xl text-slate-800 text-center mb-1">{game.name}</h1>
        <p className="text-slate-500 text-center mb-8">{game.description}</p>
        {game.slug === "vong-quay-may-man" && <WheelGame {...common} coinMin={game.coinMin} coinMax={game.coinMax} />}
        {game.slug === "cau-ca-doi-xu" && <FishingGame {...common} />}
        {game.slug === "ghep-hinh-du-lich" && <PuzzleSwapGame {...common} />}
        {game.slug === "tim-cap-hinh-anh" && <MemoryMatchGame {...common} />}
        {game.slug === "click-nhan-xu" && <ClickCollectGame {...common} />}
      </section>
      <Footer />
    </>
  );
}

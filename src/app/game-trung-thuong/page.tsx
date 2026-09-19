import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/page-seo";
import { getActor } from "@/lib/auth-actor";
import { getGameBannerSettings } from "@/lib/game-banner-settings";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import GameHero from "@/components/game/GameHero";
import GameQuickPicker from "@/components/game/GameQuickPicker";
import GameFeaturedStrip from "@/components/game/GameFeaturedStrip";
import GameCoin from "@/components/game/GameCoin";
import HowToPlaySteps from "@/components/game/HowToPlaySteps";
import RewardBanner from "@/components/game/RewardBanner";
import RedeemButton from "@/components/game/RedeemButton";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/game-trung-thuong");
}

const BADGE_BY_SLUG: Record<string, "hot" | "new"> = {
  "vong-quay-may-man": "hot",
  "nhiem-vu-hang-ngay": "new",
};

export default async function GameTrungThuongPage() {
  const actor = await getActor();
  const isUser = actor?.type === "user";

  const [games, featuredGames, rewards, user, bannerSettings] = await Promise.all([
    prisma.game.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.game.findMany({ where: { active: true, featuredOrder: { not: null } }, orderBy: { featuredOrder: "asc" }, take: 4 }),
    prisma.rewardItem.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    isUser ? prisma.user.findUnique({ where: { id: actor!.id }, select: { coins: true } }) : Promise.resolve(null),
    getGameBannerSettings(),
  ]);

  const balance = user?.coins ?? 0;

  return (
    <>
      <Header />
      <GameHero banner={bannerSettings.heroBanner} />

      <section id="danh-sach-game" className="bg-game-lightest py-16 lg:py-[72px]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="font-display font-extrabold text-[28px] sm:text-[32px] text-game-textDark flex items-center gap-2.5 mb-2">
            <i className="fa-solid fa-gamepad text-game-primary" aria-hidden="true" /> Danh sách game hấp dẫn
          </h2>
          <p className="text-game-textGray text-base sm:text-lg mb-6">
            Chơi đơn giản – Nhận thưởng ngay – Càng chơi càng mê!
          </p>

          {games.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-game-card p-12 text-center">
              <i className="fa-solid fa-gamepad text-4xl text-game-primary/40 mb-3" aria-hidden="true" />
              <p className="font-display font-bold text-game-textDark mb-1">Chưa có game nào</p>
              <p className="text-game-textGray mb-5">Các trò chơi mới sẽ sớm được cập nhật.</p>
              <Link href="/" className="text-game-primary font-bold hover:underline">
                Khám phá Phan Thiết
              </Link>
            </div>
          ) : (
            <>
              <GameQuickPicker games={games} badgeBySlug={BADGE_BY_SLUG} />
              <GameFeaturedStrip items={featuredGames.map((g) => ({ game: g, image: g.featuredImage }))} />
            </>
          )}
        </div>
      </section>

      <HowToPlaySteps />

      <section className="bg-game-light py-16 lg:py-[72px]">
        <div className="max-w-[1340px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h2 className="font-display font-extrabold text-[26px] sm:text-[30px] text-game-textDark flex items-center gap-2.5">
              <i className="fa-solid fa-gift text-game-primary" aria-hidden="true" /> Đổi thưởng từ xu
            </h2>
            {isUser ? (
              <GameCoin size="lg" text={`Bạn có ${balance.toLocaleString("vi-VN")} xu`} />
            ) : (
              <Link href="/dang-nhap?callbackUrl=/game-trung-thuong" className="text-sm font-bold text-game-primary hover:underline">
                Đăng nhập để xem xu của bạn →
              </Link>
            )}
          </div>
          <p className="text-game-textGray text-base sm:text-lg mb-8">
            Tích lũy xu từ các trò chơi để đổi lấy những phần thưởng hấp dẫn:
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewards.map((r) => (
              <div
                key={r.id}
                className="group bg-white rounded-3xl shadow-game-card hover:shadow-game-cardHover hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col"
              >
                <div className="relative aspect-square bg-game-light overflow-hidden">
                  {r.image ? (
                    <Image
                      src={r.image}
                      alt={r.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fa-solid fa-gift text-game-primary text-4xl" aria-hidden="true" />
                    </div>
                  )}
                  {r.category && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[11px] font-bold text-game-textGray px-2.5 py-1 rounded-full">
                      {r.category}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="font-display font-bold text-game-textDark mb-1 line-clamp-1">{r.name}</p>
                  <p className="text-xs text-game-textGray leading-relaxed mb-3 line-clamp-2 flex-1">{r.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <GameCoin text={`${r.coinCost.toLocaleString("vi-VN")} xu`} />
                    {r.stock != null && <span className="text-[11px] text-game-textGray">Còn {r.stock}</span>}
                  </div>
                  <RedeemButton
                    rewardId={r.id}
                    rewardName={r.name}
                    coinCost={r.coinCost}
                    isLoggedIn={isUser}
                    canAfford={balance >= r.coinCost}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RewardBanner image={bannerSettings.rewardBanner} />

      <Footer />
    </>
  );
}

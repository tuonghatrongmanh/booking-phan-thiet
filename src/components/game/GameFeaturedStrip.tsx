import Link from "next/link";
import Image from "next/image";
import GameCardIllustration from "./GameCardIllustration";

type Game = { id: string; slug: string; name: string; comingSoon: boolean };
type FeaturedItem = { game: Game; image: string | null };

// Khoi "Game noi bat" dat duoi dai chon nhanh - bo cuc anh poster + tieu de + nut
// "Choi game" theo dung mau (icon + tieu de tren dau, hang ngang 4 anh poster ben
// duoi). game.featuredImage la anh THAT admin tu upload qua GameForm (xem
// /admin/games) - chua upload thi tam dung lai illustration SVG da co, khong bia anh.
export default function GameFeaturedStrip({ items }: { items: FeaturedItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-10">
      <p className="flex items-center gap-2.5 font-display font-extrabold text-xl sm:text-2xl text-game-textDark mb-5">
        <i className="fa-solid fa-gem text-game-primary" aria-hidden="true" /> Game nổi bật
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        {items.map(({ game, image }) => (
          <div key={game.id} className="bg-white rounded-2xl shadow-game-card overflow-hidden">
            <div
              className="relative w-full aspect-[3/4] flex items-center justify-center"
              style={{ background: "linear-gradient(160deg, var(--color-game-primary), var(--color-game-deep))" }}
            >
              {image ? (
                <Image src={image} alt={game.name} fill className="object-cover" />
              ) : (
                <GameCardIllustration slug={game.slug} />
              )}
              {game.comingSoon && (
                <span className="absolute inset-0 bg-white/55 flex items-center justify-center text-xs font-bold text-game-navy">
                  Sắp ra mắt
                </span>
              )}
            </div>

            <div className="p-3 flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-game-textDark line-clamp-1 min-w-0">{game.name}</p>
              {game.comingSoon ? (
                <span className="shrink-0 text-[11px] font-bold text-slate-400 border-2 border-slate-200 rounded-full px-2.5 py-1">
                  Sắp ra
                </span>
              ) : (
                <Link
                  href={`/game-trung-thuong/${game.slug}`}
                  className="shrink-0 text-[11px] font-bold text-game-primary border-2 border-game-primary rounded-full px-2.5 py-1 hover:bg-game-primary hover:text-white transition-colors"
                >
                  Chơi game
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

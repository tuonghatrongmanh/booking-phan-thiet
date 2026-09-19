import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleActiveButton from "@/components/admin/ToggleActiveButton";

export const dynamic = "force-dynamic";

export default async function AdminGamesListPage() {
  const games = await prisma.game.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Danh sách game</h1>
          <p className="text-slate-400">Quản lý mini-game ở trang Game trúng thưởng</p>
        </div>
        <Link
          href="/admin/games/new"
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5"
        >
          + Thêm game
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {games.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có game nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Game</th>
                <th className="px-5 py-3 font-semibold">Xu thưởng</th>
                <th className="px-5 py-3 font-semibold">Lượt/ngày</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {g.image ? (
                        <span className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          <Image src={g.image} alt="" fill className="object-cover" />
                        </span>
                      ) : (
                        <span className="w-9 h-9 rounded-lg bg-brand-sky text-brand-blue flex items-center justify-center shrink-0">
                          <i className={g.icon} aria-hidden="true" />
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1">{g.name}</p>
                        <p className="text-xs text-slate-400">/{g.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {g.coinMin} - {g.coinMax} xu
                  </td>
                  <td className="px-5 py-3 text-slate-500">{g.dailyLimit}</td>
                  <td className="px-5 py-3 space-x-1.5">
                    <ToggleActiveButton url={`/api/games/${g.id}`} active={g.active} activeLabel="Hiện" inactiveLabel="Ẩn" />
                    <ToggleActiveButton
                      url={`/api/games/${g.id}`}
                      active={g.comingSoon}
                      field="comingSoon"
                      activeLabel="Sắp ra mắt"
                      inactiveLabel="Đã ra mắt"
                    />
                    {g.featuredOrder != null && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full text-brand-purple bg-brand-purpleBg">
                        Nổi bật #{g.featuredOrder}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/games/${g.id}/edit`}
                      className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Sửa
                    </Link>
                    <DeleteButton url={`/api/games/${g.id}`} confirmText={`Xóa game "${g.name}"?`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

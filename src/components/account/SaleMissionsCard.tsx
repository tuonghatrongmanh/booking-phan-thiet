import SaleRankBadge from "@/components/sale/SaleRankBadge";
import { RANK_TIERS, getSaleRank } from "@/lib/sale-points";

type MissionRow = { mission: { id: string; title: string; description: string; points: number }; done: boolean };

export default function SaleMissionsCard({ points, missions }: { points: number; missions: MissionRow[] }) {
  const rank = getSaleRank(points);
  const nextTier = [...RANK_TIERS].reverse().find((t) => t.min > points);
  const doneCount = missions.filter((m) => m.done).length;

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-1">
        <p className="font-bold text-slate-700 flex items-center gap-2">
          <i className="fa-solid fa-ranking-star text-brand-blue" aria-hidden="true" /> Xếp hạng &amp; Nhiệm vụ
        </p>
        <SaleRankBadge points={points} size="md" />
      </div>
      <p className="text-xs text-slate-400 mb-4">
        {points} điểm uy tín — hoàn thành nhiệm vụ dưới đây để tăng hạng, giúp hồ sơ của bạn nổi bật và được ưu tiên hiển thị hơn.
      </p>

      {nextTier && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Còn {nextTier.min - points} điểm để đạt hạng &quot;{nextTier.label}&quot;</span>
            <span>{points}/{nextTier.min}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (points / nextTier.min) * 100)}%`, backgroundColor: rank.color }}
            />
          </div>
        </div>
      )}

      <p className="text-xs font-semibold text-slate-500 mb-2">Nhiệm vụ ({doneCount}/{missions.length} hoàn thành)</p>
      <div className="space-y-2">
        {missions.map(({ mission, done }) => (
          <div
            key={mission.id}
            className={`flex items-start gap-3 rounded-xl p-3 border ${
              done ? "bg-brand-green/5 border-brand-green/20" : "bg-slate-50 border-slate-100"
            }`}
          >
            <span
              className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                done ? "bg-brand-green text-white" : "bg-slate-200 text-slate-400"
              }`}
            >
              <i className={done ? "fa-solid fa-check" : "fa-solid fa-lock"} aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${done ? "text-slate-700" : "text-slate-500"}`}>{mission.title}</p>
              <p className="text-xs text-slate-400">{mission.description}</p>
            </div>
            <span className={`text-xs font-bold shrink-0 ${done ? "text-brand-green" : "text-slate-400"}`}>
              +{mission.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

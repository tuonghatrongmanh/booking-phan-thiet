import { getSaleRank } from "@/lib/sale-points";

export default function SaleRankBadge({ points, size = "sm" }: { points: number; size?: "sm" | "md" }) {
  const rank = getSaleRank(points);
  const isSmall = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full text-white shrink-0 ${
        isSmall ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1"
      }`}
      style={{ backgroundColor: rank.color }}
      title={`${points} điểm uy tín`}
    >
      <i className={rank.icon} aria-hidden="true" />
      {rank.label}
    </span>
  );
}

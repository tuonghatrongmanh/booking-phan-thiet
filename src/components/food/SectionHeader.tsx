import Link from "next/link";

export default function SectionHeader({
  icon,
  title,
  subtitle,
  viewAllHref,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="w-12 h-12 rounded-xl bg-food-light text-food-primary flex items-center justify-center text-[22px] shrink-0">
          <i className={icon} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display font-bold text-[24px] sm:text-[28px] text-food-text leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-food-textMuted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="group shrink-0 flex items-center gap-1.5 text-sm font-semibold text-food-primary"
        >
          Xem tất cả
          <i className="fa-solid fa-arrow-right text-xs transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

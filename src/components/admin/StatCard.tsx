import Link from "next/link";

// Component KPI dung chung cho toan dashboard - nhan {value, previousValue} va TU
// TINH chi bao tang/giam/khong doi (khong hard-code mau/chieu) de sau nay backend
// chi can tra ve 2 con so la component tu render dung, de mo rong them KPI moi.
export type StatCardProps = {
  label: string;
  value: number;
  previousValue?: number;
  compareLabel?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  href?: string;
  variant?: "default" | "warning";
};

function ChangeIndicator({ value, previousValue, compareLabel = "so với hôm qua" }: { value: number; previousValue?: number; compareLabel?: string }) {
  if (previousValue === undefined) return null;

  if (previousValue === value) {
    return (
      <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-2">
        <i className="fa-solid fa-arrows-left-right text-[10px]" aria-hidden="true" /> Không đổi {compareLabel}
      </p>
    );
  }

  const increased = value > previousValue;
  const diff = value - previousValue;
  const percent = previousValue === 0 ? 100 : Math.round((Math.abs(diff) / previousValue) * 100);

  return (
    <p className={`text-xs font-semibold flex items-center gap-1 mt-2 ${increased ? "text-brand-green" : "text-brand-red"}`}>
      <i className={`fa-solid ${increased ? "fa-arrow-up" : "fa-arrow-down"} text-[10px]`} aria-hidden="true" />
      {increased ? "+" : "-"}
      {Math.abs(diff)} ({percent}%) {compareLabel}
    </p>
  );
}

export default function StatCard({ label, value, previousValue, compareLabel, icon, iconColor, iconBg, href, variant = "default" }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          <i className={icon} aria-hidden="true" />
        </span>
        <p className="text-[13px] font-semibold text-slate-500">{label}</p>
      </div>
      <p className="font-display font-extrabold text-3xl text-slate-800">{value.toLocaleString("vi-VN")}</p>
      <ChangeIndicator value={value} previousValue={previousValue} compareLabel={compareLabel} />
    </>
  );

  const className = `block min-w-0 bg-white rounded-2xl shadow-card p-5 transition ${
    variant === "warning" && value > 0 ? "border border-red-100 bg-brand-redBg/30" : ""
  } ${href ? "hover:shadow-lg" : ""}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}

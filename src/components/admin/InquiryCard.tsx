import type { ReactNode } from "react";

export type InquiryChip = { icon: string; text: string; tone?: "blue" | "slate" };

// Thẻ 1 đơn (đặt phòng / thuê xe) trong trang quản lý - thay cho bảng nhiều cột hay bị rớt chữ.
// 4 khối rõ ràng: thông tin đơn | khách hàng | tiền cọc | trạng thái. Điện thoại xếp dọc.
export default function InquiryCard({
  title,
  subtitle,
  chips,
  locationLabel,
  location,
  note,
  sentAt,
  customer,
  deposit,
  status,
}: {
  title: string;
  subtitle?: string | null;
  chips: InquiryChip[];
  locationLabel?: string;
  location?: string | null;
  note?: string | null;
  sentAt: string;
  customer: ReactNode;
  deposit: ReactNode;
  status: ReactNode;
}) {
  const label = "text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1.5";
  return (
    <article className="bg-white rounded-2xl shadow-card border border-slate-100 p-4 sm:p-5 grid gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-start">
      <div className="min-w-0">
        <p className={label}>Đơn</p>
        <p className="font-display font-bold text-lg text-slate-800 leading-snug">{title}</p>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {chips.map((c) => (
            <span
              key={c.text}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold rounded-full px-2.5 py-1 ${
                c.tone === "blue" ? "bg-brand-sky text-brand-blue" : "bg-slate-100 text-slate-600"
              }`}
            >
              <i className={c.icon} aria-hidden="true" /> {c.text}
            </span>
          ))}
        </div>
        {location && (
          <p className="mt-2 text-[13px] text-slate-600 leading-snug line-clamp-2" title={location}>
            <i className="fa-solid fa-location-dot text-brand-red mr-1.5" aria-hidden="true" />
            <span className="text-slate-400">{locationLabel ?? "Địa điểm"}: </span>
            {location}
          </p>
        )}
        {note && (
          <p className="mt-1.5 text-[13px] text-slate-500 leading-snug line-clamp-2 italic" title={note}>
            <i className="fa-regular fa-comment mr-1.5 not-italic" aria-hidden="true" />
            {note}
          </p>
        )}
        <p className="mt-2 text-[11px] text-slate-400">Gửi lúc {sentAt}</p>
      </div>

      <div className="min-w-0">
        <p className={label}>Khách hàng</p>
        {customer}
      </div>

      <div className="min-w-0">
        <p className={label}>Tiền cọc</p>
        {deposit}
      </div>

      <div>
        <p className={label}>Trạng thái</p>
        {status}
      </div>
    </article>
  );
}

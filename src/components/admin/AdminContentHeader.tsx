"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { findBreadcrumbLabel } from "@/lib/admin-nav";
import { resolveDateRange } from "@/lib/admin-date-range";
import AdminGlobalSearch from "./AdminGlobalSearch";
import AdminNotifications from "./AdminNotifications";
import AdminDateFilter from "./AdminDateFilter";
import AdminAccountMenu from "./AdminAccountMenu";

export default function AdminContentHeader({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const label = findBreadcrumbLabel(pathname);
  const { label: rangeLabel } = resolveDateRange({
    range: searchParams.get("range") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  return (
    <div className="hidden lg:flex items-center gap-4 bg-white border-b border-slate-100 px-6 py-3 sticky top-0 z-20">
      <nav className="flex items-center gap-1.5 text-sm shrink-0">
        <Link href="/admin" className="text-slate-400 hover:text-brand-blue transition" aria-label="Về Tổng quan">
          <i className="fa-solid fa-house" aria-hidden="true" />
        </Link>
        <i className="fa-solid fa-chevron-right text-[9px] text-slate-300" aria-hidden="true" />
        <span className="font-semibold text-slate-700">{label}</span>
      </nav>

      <div className="flex-1 flex justify-center">
        <AdminGlobalSearch />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Xem trang web"
          title="Xem trang web"
          className="relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
        >
          <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
        </Link>
        <AdminNotifications />
        <AdminDateFilter currentLabel={rangeLabel} />
        <span className="w-px h-7 bg-slate-100" aria-hidden="true" />
        <AdminAccountMenu userName={userName} />
      </div>
    </div>
  );
}

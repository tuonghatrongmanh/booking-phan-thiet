import Link from "next/link";

export default function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  const baseBtn = "w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition";

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-2" aria-label="Phân trang">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-label="Trang trước"
        aria-disabled={currentPage === 1}
        className={`${baseBtn} border border-slate-200 text-slate-500 hover:bg-slate-50 ${
          currentPage === 1 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
      </Link>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`${baseBtn} ${
              p === currentPage ? "bg-brand-blue text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-label="Trang sau"
        aria-disabled={currentPage === totalPages}
        className={`${baseBtn} border border-slate-200 text-slate-500 hover:bg-slate-50 ${
          currentPage === totalPages ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
      </Link>
    </nav>
  );
}

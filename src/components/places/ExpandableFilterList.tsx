"use client";

import Link from "next/link";
import { useState } from "react";

export type FilterListItem = {
  key: string;
  label: string;
  count: number;
  href: string;
  active: boolean;
};

export default function ExpandableFilterList({
  items,
  initialVisible = 6,
}: {
  items: FilterListItem[];
  initialVisible?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, initialVisible);

  return (
    <div className="space-y-2">
      {visible.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className="flex items-center gap-2.5 text-sm group"
        >
          <span
            className={`w-4 h-4 rounded-[4px] border shrink-0 flex items-center justify-center transition ${
              item.active ? "bg-brand-blue border-brand-blue" : "border-slate-300 group-hover:border-brand-blue"
            }`}
          >
            {item.active && <i className="fa-solid fa-check text-white text-[9px]" aria-hidden="true" />}
          </span>
          <span className={`flex-1 ${item.active ? "text-brand-blue font-semibold" : "text-slate-600"}`}>{item.label}</span>
          <span className="text-slate-400 text-xs">({item.count})</span>
        </Link>
      ))}

      {items.length > initialVisible && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-xs font-semibold text-brand-blue hover:underline pt-0.5"
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
}

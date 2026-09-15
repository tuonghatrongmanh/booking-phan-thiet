"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SearchGroup = { label: string; items: { id: string; title: string; href: string }[] };

export default function AdminGlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setGroups([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`)
        .then((r) => r.json())
        .then((d) => setGroups(d.groups ?? []))
        .catch(() => setGroups([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full max-w-[420px]">
      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" aria-hidden="true" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Tìm kiếm bài viết, địa điểm, thành viên..."
          className="w-full h-[38px] sm:h-[40px] pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 focus:bg-white transition"
        />
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-2xl border border-slate-100 max-h-96 overflow-y-auto scrollbar-none">
          {loading ? (
            <p className="p-4 text-sm text-slate-400 text-center">Đang tìm...</p>
          ) : groups.length === 0 ? (
            <p className="p-4 text-sm text-slate-400 text-center">Không tìm thấy kết quả phù hợp.</p>
          ) : (
            <div className="p-2">
              <p className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wide">Kết quả tìm kiếm</p>
              {groups.map((g) => (
                <div key={g.label} className="mb-1.5">
                  <p className="text-xs font-bold text-slate-500 px-2 py-1">{g.label}</p>
                  {g.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        router.push(item.href);
                        setOpen(false);
                        setQ("");
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition truncate"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

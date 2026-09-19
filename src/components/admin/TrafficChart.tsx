"use client";

import { useEffect, useRef, useState } from "react";

type Point = { label: string; visits: number; uniqueIps: number };
type Range = "24h" | "7d" | "30d";

const RANGES: { value: Range; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
];

const CHART_HEIGHT = 200;
const PADDING_LEFT = 32;
const PADDING_BOTTOM = 20;
const PADDING_TOP = 10;

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

export default function TrafficChart({ onSummaryChange }: { onSummaryChange?: (totalVisits: number, uniqueIps: number) => void }) {
  const [range, setRange] = useState<Range>("24h");
  const [data, setData] = useState<Point[] | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [containerRef, width] = useElementWidth<HTMLDivElement>();

  useEffect(() => {
    setData(null);
    fetch(`/api/admin/traffic?range=${range}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.data ?? []);
        if (onSummaryChange && d.data) {
          const totalVisits = d.data.reduce((s: number, p: Point) => s + p.visits, 0);
          const uniqueIps = Math.max(...d.data.map((p: Point) => p.uniqueIps), 0);
          onSummaryChange(totalVisits, uniqueIps);
        }
      })
      .catch(() => setData([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const chartWidth = Math.max(width, 200);
  const plotWidth = chartWidth - PADDING_LEFT - 8;
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const maxVal = data && data.length > 0 ? Math.max(...data.map((p) => p.visits), 4) : 4;
  const niceMax = Math.ceil(maxVal / 4) * 4 || 4;

  function xAt(i: number) {
    if (!data || data.length <= 1) return PADDING_LEFT;
    return PADDING_LEFT + (i / (data.length - 1)) * plotWidth;
  }
  function yAt(v: number) {
    return PADDING_TOP + plotHeight - (v / niceMax) * plotHeight;
  }

  const visitsPath = data && data.length > 0 ? data.map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(p.visits)}`).join(" ") : "";
  const ipsPath = data && data.length > 0 ? data.map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(p.uniqueIps)}`).join(" ") : "";

  const labelStep = data ? Math.max(1, Math.ceil(data.length / (range === "24h" ? 8 : 10))) : 1;

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-bold text-slate-800">Lượt truy cập theo giờ (hôm nay)</h3>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                range === r.value ? "bg-brand-blue text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 mb-3 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" /> Tổng lượt truy cập
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-green" /> IP duy nhất
        </span>
      </div>

      <div ref={containerRef} className="relative w-full" style={{ height: CHART_HEIGHT }}>
        {data === null ? (
          <div className="absolute inset-0 bg-slate-100 rounded-lg animate-pulse" />
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">Chưa có dữ liệu.</div>
        ) : (
          <svg
            width={chartWidth}
            height={CHART_HEIGHT}
            onMouseLeave={() => setHoverIdx(null)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const idx = Math.round(((x - PADDING_LEFT) / plotWidth) * (data.length - 1));
              setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
            }}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <g key={f}>
                <line
                  x1={PADDING_LEFT}
                  x2={chartWidth - 8}
                  y1={PADDING_TOP + plotHeight * (1 - f)}
                  y2={PADDING_TOP + plotHeight * (1 - f)}
                  stroke="#F1F5F9"
                  strokeWidth={1}
                />
                <text x={0} y={PADDING_TOP + plotHeight * (1 - f) + 3} fontSize={9} fill="#94A3B8">
                  {Math.round(niceMax * f)}
                </text>
              </g>
            ))}

            <path d={visitsPath} fill="none" stroke="var(--color-brand-blue, var(--theme-primary))" strokeWidth={2} />
            <path d={ipsPath} fill="none" stroke="var(--color-brand-green, #1ea34c)" strokeWidth={2} strokeDasharray="4 3" />

            {data.map((p, i) =>
              i % labelStep === 0 ? (
                <text key={i} x={xAt(i)} y={CHART_HEIGHT - 4} fontSize={9} fill="#94A3B8" textAnchor="middle">
                  {p.label}
                </text>
              ) : null
            )}

            {hoverIdx !== null && (
              <>
                <line x1={xAt(hoverIdx)} x2={xAt(hoverIdx)} y1={PADDING_TOP} y2={PADDING_TOP + plotHeight} stroke="#CBD5E1" strokeWidth={1} />
                <circle cx={xAt(hoverIdx)} cy={yAt(data[hoverIdx].visits)} r={3.5} fill="var(--theme-primary)" />
                <circle cx={xAt(hoverIdx)} cy={yAt(data[hoverIdx].uniqueIps)} r={3.5} fill="#1ea34c" />
              </>
            )}
          </svg>
        )}

        {hoverIdx !== null && data && data[hoverIdx] && (
          <div
            className="absolute bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
            style={{ left: Math.min(xAt(hoverIdx) + 10, chartWidth - 150), top: 10 }}
          >
            <p className="font-bold mb-1">{data[hoverIdx].label}</p>
            <p className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-blue" /> Tổng lượt truy cập {data[hoverIdx].visits}
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-green" /> IP duy nhất {data[hoverIdx].uniqueIps}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

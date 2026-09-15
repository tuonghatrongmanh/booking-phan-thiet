"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatPriceVnd } from "@/lib/place-amenities";

const MIN = 0;
const MAX = 5_000_000;
const STEP = 50_000;

const THUMB =
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-blue [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer " +
  "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-blue [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer";

export default function PriceRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [min, setMin] = useState(() => Number(searchParams.get("minPrice") ?? MIN));
  const [max, setMax] = useState(() => Number(searchParams.get("maxPrice") ?? MAX));

  function commit(nextMin: number, nextMax: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextMin > MIN) params.set("minPrice", String(nextMin));
    else params.delete("minPrice");
    if (nextMax < MAX) params.set("maxPrice", String(nextMax));
    else params.delete("maxPrice");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const minPct = ((min - MIN) / (MAX - MIN)) * 100;
  const maxPct = ((max - MIN) / (MAX - MIN)) * 100;

  return (
    <div>
      <div className="relative h-1.5 rounded-full bg-slate-200 mt-3 mb-4">
        <div
          className="absolute h-1.5 rounded-full bg-brand-blue"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={min}
          onChange={(e) => setMin(Math.min(Number(e.target.value), max - STEP))}
          onMouseUp={() => commit(min, max)}
          onTouchEnd={() => commit(min, max)}
          onBlur={() => commit(min, max)}
          aria-label="Giá tối thiểu mỗi đêm"
          className={`pointer-events-none absolute w-full h-1.5 top-0 m-0 appearance-none bg-transparent ${THUMB}`}
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={max}
          onChange={(e) => setMax(Math.max(Number(e.target.value), min + STEP))}
          onMouseUp={() => commit(min, max)}
          onTouchEnd={() => commit(min, max)}
          onBlur={() => commit(min, max)}
          aria-label="Giá tối đa mỗi đêm"
          className={`pointer-events-none absolute w-full h-1.5 top-0 m-0 appearance-none bg-transparent ${THUMB}`}
        />
      </div>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{formatPriceVnd(min)}</span>
        <span>{max >= MAX ? `${formatPriceVnd(MAX)}+` : formatPriceVnd(max)}</span>
      </div>
    </div>
  );
}

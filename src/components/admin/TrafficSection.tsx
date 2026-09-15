"use client";

import { useState } from "react";
import TrafficChart from "./TrafficChart";

export default function TrafficSection() {
  const [summary, setSummary] = useState<{ visits: number; uniqueIps: number } | null>(null);

  return (
    <div className="grid lg:grid-cols-[1fr_220px] gap-4 mb-6 items-stretch min-w-0">
      <TrafficChart onSummaryChange={(visits, uniqueIps) => setSummary({ visits, uniqueIps })} />
      <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col justify-center min-w-0">
        <div className="pb-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-400 mb-1">Tổng lượt truy cập</p>
          <p className="font-display font-extrabold text-2xl text-slate-800">
            {summary ? summary.visits.toLocaleString("vi-VN") : "—"}
          </p>
        </div>
        <div className="pt-4">
          <p className="text-xs font-semibold text-slate-400 mb-1">IP duy nhất</p>
          <p className="font-display font-extrabold text-2xl text-slate-800">
            {summary ? summary.uniqueIps.toLocaleString("vi-VN") : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

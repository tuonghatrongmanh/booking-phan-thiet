"use client";

import { useEffect, useState } from "react";

type ActivityData = {
  dailyCounts: { date: string; count: number }[];
  mutationCount: number;
  totalRequests: number;
  lastActiveAt: string | null;
  firstSeenToday: string | null;
  recentActions: { id: string; path: string; method: string; statusCode: number | null; durationMs: number | null; createdAt: string }[];
};

function formatDateTime(iso: string | null) {
  if (!iso) return "Chưa có";
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function shortDay(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function StaffActivityPanel({ staffId }: { staffId: string }) {
  const [data, setData] = useState<ActivityData | null>(null);

  useEffect(() => {
    fetch(`/api/admin/staff/${staffId}/activity`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [staffId]);

  if (!data) {
    return <div className="bg-white rounded-2xl shadow-card p-6 text-center text-slate-400">Đang tải hoạt động...</div>;
  }

  const today = data.dailyCounts[data.dailyCounts.length - 1]?.count ?? 0;
  const yesterday = data.dailyCounts[data.dailyCounts.length - 2]?.count ?? 0;
  const diff = today - yesterday;
  const maxCount = Math.max(1, ...data.dailyCounts.map((d) => d.count));

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-xs text-slate-400 mb-1">Đăng nhập gần nhất</p>
          <p className="font-bold text-slate-800">{formatDateTime(data.lastActiveAt)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-xs text-slate-400 mb-1">Hôm nay so với hôm qua</p>
          <p className={`font-bold ${diff >= 0 ? "text-brand-green" : "text-brand-red"}`}>
            {today} thao tác {diff !== 0 && <span className="text-xs">({diff > 0 ? "+" : ""}{diff})</span>}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-xs text-slate-400 mb-1">Tổng thao tác thay đổi (14 ngày)</p>
          <p className="font-bold text-slate-800">{data.mutationCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-5">
        <p className="font-bold text-slate-700 mb-4">Hoạt động 14 ngày gần nhất</p>
        <div className="flex items-end gap-1.5 h-32">
          {data.dailyCounts.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full bg-brand-blue rounded-t"
                style={{ height: `${Math.max(4, (d.count / maxCount) * 100)}%` }}
                title={`${d.count} thao tác`}
              />
              <span className="text-[10px] text-slate-400">{shortDay(d.date)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Thời gian</th>
              <th className="px-4 py-2.5 font-semibold">Hành động</th>
              <th className="px-4 py-2.5 font-semibold">Đường dẫn</th>
              <th className="px-4 py-2.5 font-semibold">Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {data.recentActions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Chưa có hoạt động nào.
                </td>
              </tr>
            ) : (
              data.recentActions.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{formatDateTime(a.createdAt)}</td>
                  <td className="px-4 py-2 text-slate-700 font-semibold">{a.method}</td>
                  <td className="px-4 py-2 text-slate-600 truncate max-w-[300px]">{a.path}</td>
                  <td className="px-4 py-2 text-slate-500">{a.statusCode ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import SecurityLogDrawer, { type SecurityLogDetail } from "./SecurityLogDrawer";

const SEVERITY_OPTIONS = [
  { value: "all", label: "Tất cả mức độ" },
  { value: "high", label: "Cao" },
  { value: "medium", label: "Trung bình" },
  { value: "low", label: "Thấp" },
];

const ENDPOINT_OPTIONS = [
  { value: "all", label: "Tất cả endpoint" },
  { value: "wp-login", label: "/wp-login.php" },
  { value: ".env", label: "/.env" },
  { value: "/api/", label: "/api/*" },
  { value: "/admin/", label: "/admin/*" },
];

const SEVERITY_BADGE: Record<string, string> = {
  high: "text-brand-red bg-brand-redBg",
  medium: "text-brand-orange bg-amber-50",
  low: "text-brand-green bg-brand-greenBg",
};
const SEVERITY_LABEL: Record<string, string> = { high: "Cao", medium: "Trung bình", low: "Thấp" };

function timeAgo(iso: string): string {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  return `${Math.floor(diffHour / 24)} ngày trước`;
}

export default function SecurityAlertTable() {
  const [severity, setSeverity] = useState("all");
  const [endpoint, setEndpoint] = useState("all");
  const [ipQuery, setIpQuery] = useState("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<SecurityLogDetail[] | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(false);
  const [drawerLog, setDrawerLog] = useState<SecurityLogDetail | null>(null);

  function load() {
    setLogs(null);
    setError(false);
    const params = new URLSearchParams({ severity, endpoint, ip: ipQuery, page: String(page) });
    fetch(`/api/admin/security-logs?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        setLogs(d.logs);
        setTotalPages(d.totalPages);
        setTotal(d.total);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severity, endpoint, ipQuery, page]);

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 min-w-0">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-triangle-exclamation text-brand-red" aria-hidden="true" />
          Cảnh báo bảo mật {total > 0 && <span className="text-slate-400 font-normal text-sm">({total})</span>}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={severity}
          onChange={(e) => {
            setSeverity(e.target.value);
            setPage(1);
          }}
          className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        >
          {SEVERITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={endpoint}
          onChange={(e) => {
            setEndpoint(e.target.value);
            setPage(1);
          }}
          className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        >
          {ENDPOINT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" aria-hidden="true" />
          <input
            type="text"
            value={ipQuery}
            onChange={(e) => {
              setIpQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm IP..."
            className="border border-slate-200 rounded-lg pl-7 pr-2.5 py-1.5 text-xs w-32 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
      </div>

      {error ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500 mb-3">Không thể tải dữ liệu. Đã xảy ra lỗi khi kết nối đến máy chủ.</p>
          <button type="button" onClick={load} className="text-xs font-bold text-brand-blue border border-brand-blueMid rounded-full px-4 py-1.5 hover:bg-brand-tint">
            Thử lại
          </button>
        </div>
      ) : logs === null ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8">
          <i className="fa-solid fa-circle-check text-brand-green text-2xl mb-2" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-600">Không phát hiện cảnh báo</p>
          <p className="text-xs text-slate-400 mt-0.5">Hệ thống hiện đang hoạt động bình thường.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead className="text-slate-400 text-left">
              <tr>
                <th className="py-2 font-semibold text-xs">Thời gian</th>
                <th className="py-2 font-semibold text-xs">Mức độ</th>
                <th className="py-2 font-semibold text-xs">Endpoint</th>
                <th className="py-2 font-semibold text-xs">IP</th>
                <th className="py-2 font-semibold text-xs">Lý do</th>
                <th className="py-2 font-semibold text-xs text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-slate-50">
                  <td className="py-2.5 text-xs text-slate-500 whitespace-nowrap">{timeAgo(log.createdAt)}</td>
                  <td className="py-2.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${SEVERITY_BADGE[log.severity ?? "low"]}`}>
                      {SEVERITY_LABEL[log.severity ?? "low"]}
                    </span>
                  </td>
                  <td className="py-2.5 text-xs">
                    <span className="font-mono text-slate-500">{log.method}</span> <span className="text-slate-700">{log.path}</span>
                  </td>
                  <td className="py-2.5 text-xs font-mono text-slate-600">
                    {log.ip}
                    {log.adminEmail && (
                      <span
                        className="ml-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-brand-blue bg-brand-tint px-1.5 py-0.5 rounded-full align-middle"
                        title={`Phiên admin: ${log.adminName || log.adminEmail}`}
                      >
                        <i className="fa-solid fa-user-shield" aria-hidden="true" /> Admin
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-xs text-slate-500 max-w-[160px] truncate">{log.reason}</td>
                  <td className="py-2.5 text-right">
                    <button type="button" onClick={() => setDrawerLog(log)} className="text-xs font-bold text-brand-blue hover:underline">
                      Xem log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30"
          >
            <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
          </button>
          <span className="text-xs text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30"
          >
            <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
          </button>
        </div>
      )}

      {drawerLog && (
        <SecurityLogDrawer
          log={drawerLog}
          onClose={() => setDrawerLog(null)}
          onResolved={() => {
            setDrawerLog(null);
            load();
          }}
          onFilterByIp={(ip) => {
            setIpQuery(ip);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}

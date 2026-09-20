import { todayInVietnam } from "@/lib/theme-schedule";

// Hàm thuần cho trang Báo cáo doanh thu + Lịch đặt phòng + xuất CSV (dễ test, không đụng DB).
// Ngày luôn quy về giờ Việt Nam ("YYYY-MM-DD") để đơn nhận cọc lúc 23h không bị lệch sang ngày khác.

export const vnDay = (d: Date) => todayInVietnam(d);

export const addDays = (key: string, n: number): string => {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
};

// Danh sách ngày [from, to] gồm cả 2 đầu
export function daysBetween(from: string, to: string, cap = 400): string[] {
  const out: string[] = [];
  for (let k = from; k <= to && out.length < cap; k = addDays(k, 1)) out.push(k);
  return out;
}

export type SeriesPoint = { key: string; label: string; stay: number; rental: number };

// Doanh thu tiền cọc theo ngày (tối đa ~2 tháng) hoặc theo tháng (kỳ dài hơn).
export function buildRevenueSeries(
  stay: { paidAt: Date | null; amount: number | null }[],
  rental: { paidAt: Date | null; amount: number | null }[],
  from: string,
  to: string
): SeriesPoint[] {
  const days = daysBetween(from, to);
  const byMonth = days.length > 62;
  const keyOf = (day: string) => (byMonth ? day.slice(0, 7) : day);
  const labelOf = (key: string) => (byMonth ? `${key.slice(5, 7)}/${key.slice(0, 4)}` : `${key.slice(8, 10)}/${key.slice(5, 7)}`);
  const map = new Map<string, SeriesPoint>();
  for (const day of days) {
    const k = keyOf(day);
    if (!map.has(k)) map.set(k, { key: k, label: labelOf(k), stay: 0, rental: 0 });
  }
  const add = (rows: { paidAt: Date | null; amount: number | null }[], field: "stay" | "rental") => {
    for (const r of rows) {
      if (!r.paidAt || !r.amount) continue;
      const p = map.get(keyOf(vnDay(r.paidAt)));
      if (p) p[field] += r.amount;
    }
  };
  add(stay, "stay");
  add(rental, "rental");
  return [...map.values()];
}

// Số phòng/xe đang bị giữ mỗi ngày của 1 tháng. mode "stay": đêm nhận phòng tới đêm trước ngày trả (ngày trả phòng đã trống);
// mode "car": tính cả ngày nhận và ngày trả xe (khoảng đóng 2 đầu, giống kiểm tra trùng ngày khi đặt).
export function occupancyForMonth(
  rows: { start: Date; end: Date; quantity: number }[],
  monthDays: string[],
  mode: "stay" | "car"
): number[] {
  return monthDays.map((day) =>
    rows.reduce((sum, r) => {
      const s = vnDay(r.start);
      const e = vnDay(r.end);
      const hit = mode === "stay" ? s <= day && day < e : s <= day && day <= e;
      return hit ? sum + Math.max(1, r.quantity) : sum;
    }, 0)
  );
}

// ---------- CSV (mở được bằng Excel, tiếng Việt không lỗi font khi có BOM ở route) ----------

// Chặn "CSV injection": tên khách do người lạ nhập, nếu bắt đầu bằng = + - @ thì Excel có thể chạy như công thức.
export function csvEscape(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\r\n");
}

// Chủ nhà chỉ được bấm "Khách đã đến" từ trước ngày nhận 1 ngày (chống bấm nhầm/bấm khống từ rất sớm).
export function canMarkArrived(todayKey: string, startKey: string): boolean {
  return todayKey >= addDays(startKey, -1);
}

export const vnd = (n: number) => `${Math.round(n).toLocaleString("vi-VN")}đ`;

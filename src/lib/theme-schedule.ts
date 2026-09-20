// Lịch tự bật giao diện lễ hội. Toàn bộ là hàm thuần (dễ test), tính theo NGÀY GIỜ VIỆT NAM.
export type ThemeWindow = { startDate: string | null; endDate: string | null; repeatYearly: boolean };

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const THEME_EFFECTS = ["none", "petals", "snow", "lanterns", "confetti", "stars"] as const;
export type ThemeEffect = (typeof THEME_EFFECTS)[number];

export const EFFECT_LABELS: Record<ThemeEffect, string> = {
  none: "Không có hiệu ứng",
  petals: "Hoa rơi (hoa mai, hoa anh đào)",
  snow: "Tuyết rơi",
  lanterns: "Đèn lồng bay lên",
  confetti: "Pháo giấy / lễ hội",
  stars: "Sao lấp lánh",
};

export function todayInVietnam(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function isWindowActive(today: string, w: ThemeWindow): boolean {
  if (!w.startDate || !w.endDate || !DATE_RE.test(w.startDate) || !DATE_RE.test(w.endDate)) return false;
  if (!w.repeatYearly) return today >= w.startDate && today <= w.endDate;
  const md = today.slice(5);
  const s = w.startDate.slice(5);
  const e = w.endDate.slice(5);
  // s > e nghĩa là khoảng vắt qua năm mới (vd 20/12 -> 05/01)
  return s <= e ? md >= s && md <= e : md >= s || md <= e;
}

// Độ dài khoảng (ngày) - dùng để chọn khoảng "cụ thể" nhất khi có nhiều giao diện cùng trúng lịch.
function windowLengthDays(w: ThemeWindow): number {
  const toDay = (d: string, year: number) => Date.UTC(year, Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));
  if (!w.startDate || !w.endDate) return Infinity;
  const y = 2001;
  let len = (toDay(w.endDate, w.repeatYearly ? y : Number(w.endDate.slice(0, 4))) - toDay(w.startDate, w.repeatYearly ? y : Number(w.startDate.slice(0, 4)))) / 86400000;
  if (w.repeatYearly && len < 0) len += 365;
  return len;
}

export function pickScheduledTheme<T extends ThemeWindow>(themes: T[], today: string): T | null {
  const hits = themes.filter((t) => isWindowActive(today, t));
  if (hits.length === 0) return null;
  return hits.reduce((best, t) => (windowLengthDays(t) < windowLengthDays(best) ? t : best));
}

// "25/08 - 03/09 (hằng năm)" hoặc "22/01/2027 - 13/02/2027"
export function formatWindow(w: ThemeWindow): string | null {
  if (!w.startDate || !w.endDate) return null;
  const fmt = (d: string) => (w.repeatYearly ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`);
  return `${fmt(w.startDate)} - ${fmt(w.endDate)}${w.repeatYearly ? " (hằng năm)" : ""}`;
}

// Gợi ý lịch cho 3 giao diện có sẵn (Tết/Trung thu tính theo âm lịch nên đổi mỗi năm - admin cập nhật lại hằng năm).
export const SUGGESTED_WINDOWS: Record<string, ThemeWindow> = {
  "quoc-khanh": { startDate: "2001-08-25", endDate: "2001-09-03", repeatYearly: true },
  "trung-thu": { startDate: "2026-09-18", endDate: "2026-09-27", repeatYearly: false },
  tet: { startDate: "2027-01-23", endDate: "2027-02-14", repeatYearly: false },
};

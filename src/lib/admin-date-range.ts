// Tinh khoang thoi gian hien tai + khoang thoi gian truoc do (cung do dai) de so
// sanh KPI - dung chung cho ca dashboard admin. "range" la preset, "from"/"to" dung
// khi nguoi dung chon "Tuy chinh".
export type DateRangeParams = { range?: string; from?: string; to?: string };

export type ResolvedRange = {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
  label: string;
  compareLabel: string;
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function resolveDateRange(params: DateRangeParams): ResolvedRange {
  const now = new Date();
  const today = startOfDay(now);

  if (params.range === "custom" && params.from && params.to) {
    const start = startOfDay(new Date(params.from));
    const end = endOfDay(new Date(params.to));
    const lengthMs = end.getTime() - start.getTime();
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - lengthMs);
    return { start, end, previousStart, previousEnd, label: "Tùy chỉnh", compareLabel: "so với kỳ trước" };
  }

  switch (params.range) {
    case "yesterday": {
      const start = new Date(today);
      start.setDate(start.getDate() - 1);
      const end = endOfDay(start);
      const previousStart = new Date(start);
      previousStart.setDate(previousStart.getDate() - 1);
      const previousEnd = endOfDay(previousStart);
      return { start, end, previousStart, previousEnd, label: "Hôm qua", compareLabel: "so với hôm trước" };
    }
    case "7d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      const end = endOfDay(now);
      const previousEnd = new Date(start.getTime() - 1);
      const previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 6);
      return { start, end, previousStart, previousEnd, label: "7 ngày qua", compareLabel: "so với 7 ngày trước" };
    }
    case "30d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      const end = endOfDay(now);
      const previousEnd = new Date(start.getTime() - 1);
      const previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 29);
      return { start, end, previousStart, previousEnd, label: "30 ngày qua", compareLabel: "so với 30 ngày trước" };
    }
    case "this-month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = endOfDay(now);
      const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end, previousStart, previousEnd, label: "Tháng này", compareLabel: "so với tháng trước" };
    }
    case "last-month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      const previousStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const previousEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
      return { start, end, previousStart, previousEnd, label: "Tháng trước", compareLabel: "so với tháng trước đó" };
    }
    default: {
      // "today" (mac dinh)
      const start = today;
      const end = endOfDay(now);
      const previousStart = new Date(today);
      previousStart.setDate(previousStart.getDate() - 1);
      const previousEnd = endOfDay(previousStart);
      return { start, end, previousStart, previousEnd, label: "Hôm nay", compareLabel: "so với hôm qua" };
    }
  }
}

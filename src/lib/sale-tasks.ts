// Nhiệm vụ nâng hạng cho Sale uy tín. Vòng đời:
//   REQUESTED (Sale xin việc) -> ASSIGNED (admin giao, có điểm thưởng) -> SUBMITTED (Sale báo xong)
//   -> DONE (admin xác nhận, cộng điểm) | REJECTED (admin từ chối ở bất kỳ bước nào trước DONE)
export type SaleTaskStatus = "REQUESTED" | "ASSIGNED" | "SUBMITTED" | "DONE" | "REJECTED";

export const TASK_STATUS_LABEL: Record<SaleTaskStatus, string> = {
  REQUESTED: "Đang chờ admin giao việc",
  ASSIGNED: "Cần làm",
  SUBMITTED: "Đã báo hoàn thành - chờ duyệt",
  DONE: "Hoàn thành",
  REJECTED: "Không được duyệt",
};

export const TASK_STATUS_TONE: Record<SaleTaskStatus, string> = {
  REQUESTED: "bg-amber-50 text-amber-700",
  ASSIGNED: "bg-brand-sky text-brand-blue",
  SUBMITTED: "bg-purple-50 text-purple-700",
  DONE: "bg-brand-greenBg text-brand-green",
  REJECTED: "bg-slate-100 text-slate-500",
};

export const MAX_OPEN_REQUESTS = 1; // mỗi Sale chỉ được có 1 yêu cầu đang chờ (tránh spam)
export const MAX_BONUS_POINTS = 100;

const NEXT: Record<SaleTaskStatus, SaleTaskStatus[]> = {
  REQUESTED: ["ASSIGNED", "REJECTED"],
  ASSIGNED: ["SUBMITTED", "REJECTED"],
  SUBMITTED: ["DONE", "ASSIGNED", "REJECTED"], // ASSIGNED = admin trả lại "làm lại"
  DONE: [],
  REJECTED: [],
};

export function canTransition(from: SaleTaskStatus, to: SaleTaskStatus): boolean {
  return NEXT[from].includes(to);
}

// Điểm thưởng của các nhiệm vụ đã hoàn thành (chỉ tính DONE)
export function sumBonus(tasks: { status: string; bonusPoints: number }[]): number {
  return tasks.reduce((n, t) => (t.status === "DONE" ? n + Math.max(0, t.bonusPoints) : n), 0);
}

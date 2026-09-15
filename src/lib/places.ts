export function avgOf(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export const PLACE_STATUS_INFO = {
  TRUSTED: { label: "Uy tín", color: "#1ea34c", bg: "bg-brand-green", icon: "fa-solid fa-shield-halved" },
  WARNING: { label: "Cần cẩn trọng", color: "#f5821f", bg: "bg-brand-orange", icon: "fa-solid fa-triangle-exclamation" },
  SCAM: { label: "Đã ghi nhận lừa đảo", color: "#e8483a", bg: "bg-brand-red", icon: "fa-solid fa-circle-exclamation" },
} as const;

export type PlaceStatusKey = keyof typeof PLACE_STATUS_INFO;

// Trang thai con/het phong-xe dong bo tu mau o Google Sheets cua chu so huu (xem
// src/lib/sheet-sync.ts). null = Place nay chua duoc anh xa toi sheet nao - khong
// hien badge, giu nguyen giao dien cu (dua vao availableRooms neu co).
export const AVAILABILITY_INFO = {
  AVAILABLE: { bg: "bg-brand-green", icon: "fa-solid fa-circle-check" },
  HOLDING: { bg: "bg-amber-500", icon: "fa-solid fa-clock" },
  UNAVAILABLE: { bg: "bg-brand-red", icon: "fa-solid fa-ban" },
} as const;

export type AvailabilityStatusKey = keyof typeof AVAILABILITY_INFO;

export function availabilityLabel(status: AvailabilityStatusKey, kind: "room" | "vehicle") {
  if (status === "HOLDING") return "Đang được giữ chỗ";
  if (status === "AVAILABLE") return kind === "room" ? "Còn phòng" : "Còn xe";
  return kind === "room" ? "Hết phòng" : "Hết xe";
}

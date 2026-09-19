import { RANK_TIERS, getSaleRank } from "@/lib/sale-points";

// Ham thuan phuc vu trang ho so Sale uy tin (/sale/[id]): chi dung du lieu THAT cua ho so -
// muc nao chua co du lieu thi khong hien (khong con o "—" trong).

export function memberSinceLabel(createdAt: Date, now: Date): string {
  const months = Math.max(0, (now.getFullYear() - createdAt.getFullYear()) * 12 + (now.getMonth() - createdAt.getMonth()));
  if (months < 1) return "Mới gia nhập";
  if (months < 12) return `${months} tháng`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years} năm` : `${years} năm ${rest} tháng`;
}

// Hang tiep theo va so diem con thieu (null neu da o hang cao nhat)
export function nextRankInfo(points: number) {
  const current = getSaleRank(points);
  const tiers = [...RANK_TIERS].sort((a, b) => a.min - b.min);
  const next = tiers.find((t) => t.min > points);
  if (!next) return { current, next: null, missing: 0, percent: 100 };
  const floor = current.min;
  const percent = Math.round(((points - floor) / (next.min - floor)) * 100);
  return { current, next, missing: next.min - points, percent: Math.max(0, Math.min(100, percent)) };
}

export type SaleStat = { key: string; icon: string; iconClass: string; value: string; label: string };

export function buildSaleStats(input: {
  ratingAverage: number;
  ratingTotal: number;
  clientsServedCount: number | null;
  yearsExperience: number | null;
  workArea: string | null;
  videoCount: number;
  createdAt: Date;
  now: Date;
}): SaleStat[] {
  const stats: SaleStat[] = [];
  if (input.ratingTotal > 0) {
    stats.push({ key: "rating", icon: "fa-solid fa-star", iconClass: "text-brand-gold", value: input.ratingAverage.toFixed(1), label: `Đánh giá (${input.ratingTotal})` });
  }
  if (input.clientsServedCount != null && input.clientsServedCount > 0) {
    stats.push({ key: "clients", icon: "fa-solid fa-users", iconClass: "text-brand-blue", value: input.clientsServedCount.toLocaleString("vi-VN") + "+", label: "Khách đã tư vấn" });
  }
  if (input.yearsExperience != null && input.yearsExperience > 0) {
    stats.push({ key: "years", icon: "fa-solid fa-award", iconClass: "text-brand-green", value: `${input.yearsExperience} năm`, label: "Kinh nghiệm" });
  }
  if (input.videoCount > 0) {
    stats.push({ key: "videos", icon: "fa-brands fa-tiktok", iconClass: "text-slate-700", value: String(input.videoCount), label: "Video review" });
  }
  stats.push({ key: "member", icon: "fa-solid fa-calendar-check", iconClass: "text-brand-blue", value: memberSinceLabel(input.createdAt, input.now), label: "Có mặt trên BookingPhanThiet" });
  stats.push({ key: "area", icon: "fa-solid fa-location-dot", iconClass: "text-brand-red", value: input.workArea || "Phan Thiết", label: "Khu vực hoạt động" });
  return stats;
}

export type TrustFact = { icon: string; text: string };

export function buildTrustFacts(input: {
  verified: boolean;
  ratingAverage: number;
  ratingTotal: number;
  videoCount: number;
  feedbackCount: number;
  rankLabel: string;
  points: number;
}): TrustFact[] {
  const facts: TrustFact[] = [];
  if (input.verified) facts.push({ icon: "fa-solid fa-shield-halved", text: "Hồ sơ đã được Admin Booking Phan Thiết xác thực" });
  if (input.ratingTotal > 0) {
    facts.push({ icon: "fa-solid fa-star", text: `${input.ratingTotal} đánh giá thật từ khách, trung bình ${input.ratingAverage.toFixed(1)}/5` });
  }
  if (input.feedbackCount > 0) facts.push({ icon: "fa-solid fa-comments", text: `${input.feedbackCount} ảnh phản hồi thật của khách trên Zalo/Facebook/TikTok` });
  if (input.videoCount > 0) facts.push({ icon: "fa-solid fa-circle-play", text: `${input.videoCount} video chia sẻ công khai để bạn tự kiểm chứng` });
  facts.push({ icon: "fa-solid fa-ranking-star", text: `Xếp hạng “${input.rankLabel}” với ${input.points} điểm uy tín tính tự động từ hồ sơ` });
  return facts;
}

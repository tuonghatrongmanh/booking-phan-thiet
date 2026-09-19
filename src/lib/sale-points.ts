type PlaceForPoints = {
  id: string;
  category: string;
  avatar: string | null;
  coverImage: string | null;
  roleTitle: string | null;
  slogan: string | null;
  workArea: string | null;
  yearsExperience: number | null;
  clientsServedCount: number | null;
  videos: { id: string }[];
  socialComments: { id: string }[];
  reviews: { rating: number }[];
  standing: { action: "SUSPENDED" | "BANNED"; active: boolean } | null;
};

export type SaleMission = {
  id: string;
  title: string;
  description: string;
  points: number;
  check: (p: PlaceForPoints) => boolean;
};

// Nhiem vu tinh diem tu dong cho Sale uy tin - moi nhiem vu la 1 dieu kien kiem tra
// truc tiep tren du lieu Place hien co (KHONG luu bang hoan thanh rieng), vi du hoan
// thien ho so, co video/testimonial, duoc danh gia tot... Tong diem quyet dinh hang
// (xem RANK_TIERS ben duoi). Sale bi dinh chi/cam (SaleStanding active) se bi tru het
// diem ve 0 - mat hang cho toi khi duoc go dinh chi.
export const SALE_MISSIONS: SaleMission[] = [
  {
    id: "profile-complete",
    title: "Hoàn thiện hồ sơ",
    description: "Có đủ ảnh đại diện, ảnh bìa, chức danh, câu giới thiệu và khu vực hoạt động",
    points: 40,
    check: (p) => Boolean(p.avatar && p.coverImage && p.roleTitle && p.slogan && p.workArea),
  },
  {
    id: "video-1",
    title: "Thêm video giới thiệu",
    description: "Có ít nhất 1 video TikTok giới thiệu dịch vụ",
    points: 20,
    check: (p) => p.videos.length >= 1,
  },
  {
    id: "video-3",
    title: "Đủ 3 video giới thiệu",
    description: "Có ít nhất 3 video TikTok giới thiệu dịch vụ",
    points: 30,
    check: (p) => p.videos.length >= 3,
  },
  {
    id: "testimonial-1",
    title: "Có phản hồi khách hàng",
    description: "Có ít nhất 1 ảnh chụp phản hồi/testimonial từ khách",
    points: 20,
    check: (p) => p.socialComments.length >= 1,
  },
  {
    id: "experience-5",
    title: "5 năm kinh nghiệm trở lên",
    description: "Số năm kinh nghiệm khai báo từ 5 năm trở lên",
    points: 30,
    check: (p) => (p.yearsExperience ?? 0) >= 5,
  },
  {
    id: "clients-50",
    title: "Phục vụ 50+ khách hàng",
    description: "Số khách đã tư vấn/phục vụ từ 50 trở lên",
    points: 30,
    check: (p) => (p.clientsServedCount ?? 0) >= 50,
  },
  {
    id: "rating-45",
    title: "Đánh giá 4.5 sao trở lên",
    description: "Điểm đánh giá trung bình từ khách hàng đạt 4.5/5 trở lên (tối thiểu 3 đánh giá)",
    points: 50,
    check: (p) => {
      if (p.reviews.length < 3) return false;
      const avg = p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length;
      return avg >= 4.5;
    },
  },
  {
    id: "reviews-10",
    title: "10 đánh giá từ khách hàng",
    description: "Nhận được từ 10 đánh giá thật từ khách hàng trở lên",
    points: 40,
    check: (p) => p.reviews.length >= 10,
  },
];

export const RANK_TIERS = [
  { min: 190, id: "diamond", label: "Uy tín Kim Cương", color: "var(--theme-primary-light)", icon: "fa-solid fa-gem" },
  { min: 120, id: "gold", label: "Uy tín", color: "#f59e0b", icon: "fa-solid fa-trophy" },
  { min: 60, id: "silver", label: "Đang phát triển", color: "#94a3b8", icon: "fa-solid fa-medal" },
  { min: 0, id: "bronze", label: "Mới gia nhập", color: "#b45309", icon: "fa-solid fa-seedling" },
] as const;

export function getSaleRank(points: number) {
  return RANK_TIERS.find((t) => points >= t.min) ?? RANK_TIERS[RANK_TIERS.length - 1];
}

export function computeSalePoints(place: PlaceForPoints): { points: number; missions: { mission: SaleMission; done: boolean }[] } {
  const missions = SALE_MISSIONS.map((mission) => ({ mission, done: mission.check(place) }));
  const isPenalized = Boolean(place.standing && place.standing.active);
  const points = isPenalized ? 0 : missions.reduce((sum, m) => sum + (m.done ? m.mission.points : 0), 0);
  return { points, missions };
}


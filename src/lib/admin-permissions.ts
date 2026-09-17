// Khung phan quyen cho tai khoan nhan vien (Admin.role === "EDITOR"). SUPER_ADMIN
// luon full quyen moi noi, khong doc file nay. Moi "section" ung voi 1 trang/nhom
// trong admin-nav.ts. Moi hanh dong (create/edit/delete/hide) co 3 muc: "none" (khong
// co quyen, khong hien nut), "direct" (lam ngay, khong can duyet), "approval" (tao
// PendingChange, cho SuperAdmin duyet o /admin/pending-changes moi ap dung thuc su).
// "delete" con co muc rieng "own" (chi duoc xoa noi dung CHINH MINH tao ra, vd bai
// Tin tuc - khong duoc xoa bai cua nguoi khac dang, tru khi co quyen "direct"/"approval").

export type PermMode = "none" | "direct" | "approval" | "own";

export type SectionPermission = {
  access: boolean; // false = an hoan toan muc nay khoi sidebar + chan route
  create: PermMode;
  edit: PermMode;
  delete: PermMode;
  hide: PermMode;
};

export const SECTION_LABELS = {
  "tin-tuc": "Tin tức",
  "luu-tru-settings": "Tổng quan Lưu trú",
  homestay: "Địa điểm / Homestay",
  "stay-areas": "Khu vực",
  "stay-amenities": "Tiện ích",
  "stay-types": "Danh mục chỗ ở",
  attractions: "Trải nghiệm & Điểm tham quan",
  foods: "Món ăn",
  "am-thuc-banner": "Banner Ẩm thực",
  "local-specialties": "Đặc sản",
  "food-categories": "Danh mục món ăn",
  sales: "Ưu đãi",
  "sale-agents": "Sale uy tín",
  "hero-tiles": "Ô danh mục trang chủ",
  reviews: "Đánh giá cộng đồng",
  banners: "Banner trang chủ",
  "brand-logos": "Thương hiệu đối tác",
  popups: "Pop-up",
  games: "Danh sách game",
  rewards: "Đổi thưởng",
  redemptions: "Đơn đổi thưởng",
  "game-banners": "Banner game",
  "car-rentals": "Thuê xe",
  "forum-comments": "Kiểm duyệt bình luận",
  settings: "Cài đặt",
  "guide-videos": "Video hướng dẫn",
  "staff-messages": "Tin nhắn",
} as const;

export type SectionKey = keyof typeof SECTION_LABELS;

export type AdminPermissions = Partial<Record<SectionKey, SectionPermission>>;

const FULL_DIRECT: SectionPermission = { access: true, create: "direct", edit: "direct", delete: "direct", hide: "direct" };
const NO_ACCESS: SectionPermission = { access: false, create: "none", edit: "none", delete: "none", hide: "none" };

// Mac dinh khi SuperAdmin tao 1 tai khoan nhan vien moi - dung theo dung yeu cau da
// trao doi: duoc dang/sua hau het noi dung, KHONG duoc xoa (phai qua duyet hoac chi
// duoc xoa bai cua chinh minh), khong dc vao Sale uy tin, khong dc xem Tong quan (xu
// ly rieng o AdminShell/middleware, khong nam trong bang nay vi Tong quan khong phai
// 1 "section" co the CRUD).
export const DEFAULT_STAFF_PERMISSIONS: AdminPermissions = {
  "tin-tuc": { access: true, create: "direct", edit: "direct", delete: "own", hide: "none" },
  "luu-tru-settings": { access: true, create: "none", edit: "approval", delete: "none", hide: "none" },
  homestay: { access: true, create: "direct", edit: "direct", delete: "none", hide: "approval" },
  "stay-areas": { access: true, create: "direct", edit: "direct", delete: "none", hide: "approval" },
  "stay-amenities": { access: true, create: "direct", edit: "direct", delete: "none", hide: "approval" },
  "stay-types": { access: true, create: "direct", edit: "direct", delete: "none", hide: "approval" },
  attractions: { access: true, create: "direct", edit: "direct", delete: "none", hide: "approval" },
  foods: { access: true, create: "direct", edit: "direct", delete: "approval", hide: "none" },
  "am-thuc-banner": { access: true, create: "direct", edit: "direct", delete: "approval", hide: "none" },
  "local-specialties": { access: true, create: "direct", edit: "direct", delete: "approval", hide: "none" },
  "food-categories": { access: true, create: "direct", edit: "direct", delete: "approval", hide: "none" },
  sales: { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  "sale-agents": NO_ACCESS,
  "hero-tiles": { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  reviews: { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  banners: { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  "brand-logos": { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  popups: { access: true, create: "direct", edit: "direct", delete: "none", hide: "direct" },
  games: { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  rewards: { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  redemptions: { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  "game-banners": { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  "car-rentals": { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  "forum-comments": { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  settings: { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  "guide-videos": { access: true, create: "direct", edit: "direct", delete: "none", hide: "none" },
  "staff-messages": { access: true, create: "none", edit: "none", delete: "none", hide: "none" },
};

export function getSectionPermission(permissions: AdminPermissions | null | undefined, section: SectionKey): SectionPermission {
  return permissions?.[section] ?? NO_ACCESS;
}

// SUPER_ADMIN: bo qua toan bo bang nay, luon full quyen truc tiep.
export function fullAccessPermissions(): AdminPermissions {
  const all = {} as AdminPermissions;
  for (const key of Object.keys(SECTION_LABELS) as SectionKey[]) all[key] = FULL_DIRECT;
  return all;
}

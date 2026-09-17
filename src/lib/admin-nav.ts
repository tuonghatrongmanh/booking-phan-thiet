export type NavItem = { href: string; label: string; icon: string };
export type NavGroup = { label: string; icon: string; children: NavItem[] };
export type NavEntry = NavItem | NavGroup;

export function isGroup(item: NavEntry): item is NavGroup {
  return "children" in item;
}

// Gom nhom theo yeu cau: "Luu tru" gom Tong quan Luu tru + Dia diem/Homestay (truoc
// day 2 muc rieng le); "Trang chu" gom 6 muc quan ly noi dung trang chu - giam tu 13
// dong xuong con 7 dong o cap 1, do nhin va de quan ly hon tren sidebar. Dat o day
// (thay vi trong AdminShell.tsx) de AdminContentHeader.tsx cung dung lai duoc cho
// breadcrumb, khong lap du lieu 2 noi.
export const NAV: NavEntry[] = [
  { href: "/admin", label: "Tổng quan", icon: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z" },
  { href: "/admin/messages", label: "Tin nhắn", icon: "M4 4h16v16H4zM4 4l8 8 8-8" },
  { href: "/admin/news", label: "Tin tức", icon: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" },
  {
    label: "Lưu trú",
    icon: "M3 10.5 12 4l9 6.5M5 9v10h14V9M9 19v-6h6v6",
    children: [
      { href: "/admin/luu-tru", label: "Tổng quan Lưu trú", icon: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z" },
      { href: "/admin/places", label: "Địa điểm / Homestay", icon: "M12 2 3 14h7l-1 8 11-13h-7l1-7z" },
      { href: "/admin/stay-areas", label: "Khu vực", icon: "M12 2 3 14h7l-1 8 11-13h-7l1-7z" },
      { href: "/admin/stay-amenities", label: "Tiện ích", icon: "M4 6h16M4 12h16M4 18h16" },
      { href: "/admin/stay-types", label: "Danh mục chỗ ở", icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
      { href: "/admin/attractions", label: "Trải nghiệm & Điểm tham quan", icon: "M12 2l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 16.9 6.2 20l1.1-6.5L2.5 8.9l6.6-.9z" },
    ],
  },
  {
    label: "Ẩm thực",
    icon: "M7 10h10M7 14h10M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z",
    children: [
      { href: "/admin/foods", label: "Món ăn", icon: "M4 6h16M4 12h16M4 18h16" },
      { href: "/admin/am-thuc-banner", label: "Banner", icon: "M3 5h18v14H3zM3 9h18M8 5v4" },
      { href: "/admin/local-specialties", label: "Đặc sản", icon: "M12 2l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 16.9 6.2 20l1.1-6.5L2.5 8.9l6.6-.9z" },
      { href: "/admin/food-categories", label: "Danh mục món ăn", icon: "M4 6h16M4 12h16M4 18h16" },
    ],
  },
  {
    label: "Trang chủ",
    icon: "M3 10.5 12 4l9 6.5M5 9v10h14V9M9 19v-6h6v6",
    children: [
      { href: "/admin/sales", label: "Ưu đãi", icon: "M12 2l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 16.9 6.2 20l1.1-6.5L2.5 8.9l6.6-.9z" },
      { href: "/admin/sale-agents", label: "Sale uy tín", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
      { href: "/admin/hero-tiles", label: "Ô danh mục trang chủ", icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
      { href: "/admin/reviews", label: "Đánh giá cộng đồng", icon: "M12 21s-7-4.5-9.5-9C1 8 3 4 7 4c2.2 0 3.7 1.3 5 3 1.3-1.7 2.8-3 5-3 4 0 6 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" },
      { href: "/admin/banners", label: "Banner", icon: "M3 5h18v14H3zM3 9h18M8 5v4" },
      { href: "/admin/brand-logos", label: "Thương hiệu đối tác", icon: "M12 2l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 16.9 6.2 20l1.1-6.5L2.5 8.9l6.6-.9z" },
      { href: "/admin/popups", label: "Pop-up", icon: "M4 4h16v12H8l-4 4z" },
      { href: "/admin/activity-samples", label: "Hoạt động minh họa", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    ],
  },
  {
    label: "Game trúng thưởng",
    icon: "M7 7h10a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4c-1.1 0-2-.9-2-2v-1H9v1c0 1.1-.9 2-2 2a4 4 0 0 1-4-4v-3a4 4 0 0 1 4-4z",
    children: [
      { href: "/admin/games", label: "Danh sách game", icon: "M4 6h16M4 12h16M4 18h16" },
      { href: "/admin/rewards", label: "Đổi thưởng", icon: "M3 8h18v4H3zM5 12h14v8H5zM12 8v12M8 8a2 2 0 1 1 4 0M16 8a2 2 0 1 0-4 0" },
      { href: "/admin/redemptions", label: "Đơn đổi thưởng", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 14l2 2 4-4" },
      { href: "/admin/game-banners", label: "Banner", icon: "M3 5h18v14H3zM3 9h18M8 5v4" },
    ],
  },
  { href: "/admin/car-rentals", label: "Thuê xe", icon: "M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2M5 17a2 2 0 1 0 4 0M5 17a2 2 0 1 1 4 0M15 17a2 2 0 1 0 4 0M15 17a2 2 0 1 1 4 0M1 11h16" },
  { href: "/admin/sheet-sync", label: "Đồng bộ Google Sheets", icon: "M9 17h6M9 13h6M9 9h1M4 4h16v16H4zM4 9h16" },
  { href: "/admin/forum", label: "Diễn đàn", icon: "M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.4 0-2.7-.3-3.9-.9L3 20l1-5.5A8.5 8.5 0 1 1 21 11.5z" },
  { href: "/admin/forum-comments", label: "Kiểm duyệt bình luận", icon: "M8 10h8M8 14h5M21 12c0 4.4-4 8-9 8-1.3 0-2.5-.2-3.6-.7L3 21l1.8-4.2A7.9 7.9 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" },
  { href: "/admin/guide-videos", label: "Video hướng dẫn", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0 0 10 9.87v4.263a1 1 0 0 0 1.555.832l3.197-2.132a1 1 0 0 0 0-1.664z M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
  { href: "/admin/users", label: "Thành viên", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { href: "/admin/staff", label: "Nhân viên", icon: "M17 20h5v-2a4 4 0 0 0-4-4h-1M9 20H4v-2a4 4 0 0 1 4-4h1m0-4a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { href: "/admin/pending-changes", label: "Chờ duyệt", icon: "M12 8v4l3 3M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" },
  {
    href: "/admin/settings",
    label: "Cài đặt",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  },
];

// Tim nhan (label) breadcrumb khop voi pathname hien tai - kiem tra ca muc con
// trong group truoc (khop dai hon/cu the hon), sau do moi den muc cap 1.
export function findBreadcrumbLabel(pathname: string): string {
  for (const item of NAV) {
    if (isGroup(item)) {
      for (const child of item.children) {
        if (pathname === child.href || pathname.startsWith(child.href + "/")) return child.label;
      }
    } else if (pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))) {
      return item.label;
    }
  }
  return "Trang quản trị";
}

// Anh xa href -> section key (dung boi AdminShell de an muc nhan vien khong co quyen
// truy cap). Href khong co trong bang nay (vd /admin, /admin/forum, /admin/users,
// /admin/sheet-sync) nghia la KHONG nam trong he thong phan quyen theo section - xu
// ly rieng (Tong quan: chi SuperAdmin; con lai: hien tai chi SuperAdmin dung, chua
// cap cho nhan vien).
export const HREF_TO_SECTION: Record<string, import("@/lib/admin-permissions").SectionKey> = {
  "/admin/activity-samples": "activity-samples",
  "/admin/messages": "staff-messages",
  "/admin/news": "tin-tuc",
  "/admin/luu-tru": "luu-tru-settings",
  "/admin/places": "homestay",
  "/admin/stay-areas": "stay-areas",
  "/admin/stay-amenities": "stay-amenities",
  "/admin/stay-types": "stay-types",
  "/admin/attractions": "attractions",
  "/admin/foods": "foods",
  "/admin/am-thuc-banner": "am-thuc-banner",
  "/admin/local-specialties": "local-specialties",
  "/admin/food-categories": "food-categories",
  "/admin/sales": "sales",
  "/admin/sale-agents": "sale-agents",
  "/admin/hero-tiles": "hero-tiles",
  "/admin/reviews": "reviews",
  "/admin/banners": "banners",
  "/admin/brand-logos": "brand-logos",
  "/admin/popups": "popups",
  "/admin/games": "games",
  "/admin/rewards": "rewards",
  "/admin/redemptions": "redemptions",
  "/admin/game-banners": "game-banners",
  "/admin/car-rentals": "car-rentals",
  "/admin/forum-comments": "forum-comments",
  "/admin/settings": "settings",
  "/admin/guide-videos": "guide-videos",
};

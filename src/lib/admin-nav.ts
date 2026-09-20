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
  { href: "/admin/bao-cao", label: "Báo cáo & doanh thu", icon: "M4 20V10M10 20V4M16 20v-8M22 20H2" },
  { href: "/admin/messages", label: "Tin nhắn", icon: "M4 4h16v16H4zM4 4l8 8 8-8" },
  { href: "/admin/news", label: "Tin tức", icon: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" },
  {
    label: "Lưu trú",
    icon: "M3 10.5 12 4l9 6.5M5 9v10h14V9M9 19v-6h6v6",
    children: [
      { href: "/admin/luu-tru", label: "Tổng quan Lưu trú", icon: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z" },
      { href: "/admin/places", label: "Địa điểm / Homestay", icon: "M12 2 3 14h7l-1 8 11-13h-7l1-7z" },
      { href: "/admin/lich-dat", label: "Lịch đặt phòng & xe", icon: "M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
      { href: "/admin/stay-booking-inquiries", label: "Yêu cầu đặt phòng", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 14l2 2 4-4" },
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
      { href: "/admin/sale-tasks", label: "Nhiệm vụ Sale", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
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
  {
    label: "Thuê xe",
    icon: "M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2M5 17a2 2 0 1 0 4 0M5 17a2 2 0 1 1 4 0M15 17a2 2 0 1 0 4 0M15 17a2 2 0 1 1 4 0M1 11h16",
    children: [
      { href: "/admin/car-rentals", label: "Danh sách xe", icon: "M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2M5 17a2 2 0 1 0 4 0M5 17a2 2 0 1 1 4 0M15 17a2 2 0 1 0 4 0M15 17a2 2 0 1 1 4 0M1 11h16" },
      { href: "/admin/rental-inquiries", label: "Yêu cầu thuê xe", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 14l2 2 4-4" },
    ],
  },
  { href: "/admin/sheet-sync", label: "Đồng bộ Google Sheets", icon: "M9 17h6M9 13h6M9 9h1M4 4h16v16H4zM4 9h16" },
  { href: "/admin/forum", label: "Diễn đàn", icon: "M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.4 0-2.7-.3-3.9-.9L3 20l1-5.5A8.5 8.5 0 1 1 21 11.5z" },
  { href: "/admin/forum-comments", label: "Kiểm duyệt bình luận", icon: "M8 10h8M8 14h5M21 12c0 4.4-4 8-9 8-1.3 0-2.5-.2-3.6-.7L3 21l1.8-4.2A7.9 7.9 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" },
  { href: "/admin/user-reviews", label: "Kiểm duyệt đánh giá", icon: "M11.48 3.5a.56.56 0 0 1 1.04 0l2.13 5.11a.56.56 0 0 0 .48.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 0 0-.18.56l1.28 5.39a.56.56 0 0 1-.84.61l-4.73-2.89a.56.56 0 0 0-.58 0l-4.73 2.89a.56.56 0 0 1-.84-.61l1.28-5.39a.56.56 0 0 0-.18-.56l-4.2-3.6a.56.56 0 0 1 .32-.99l5.52-.44a.56.56 0 0 0 .48-.35L11.48 3.5z" },
  { href: "/admin/guide-videos", label: "Video hướng dẫn", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0 0 10 9.87v4.263a1 1 0 0 0 1.555.832l3.197-2.132a1 1 0 0 0 0-1.664z M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
  { href: "/admin/users", label: "Thành viên", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { href: "/admin/password-reset-requests", label: "Yêu cầu đặt lại mật khẩu", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0v3m-6-3a6 6 0 1 1 12 0M5 21h14" },
  {
    label: "Nhân viên",
    icon: "M17 20h5v-2a4 4 0 0 0-4-4h-1M9 20H4v-2a4 4 0 0 1 4-4h1m0-4a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    children: [
      { href: "/admin/staff", label: "Danh sách nhân viên", icon: "M17 20h5v-2a4 4 0 0 0-4-4h-1M9 20H4v-2a4 4 0 0 1 4-4h1m0-4a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
      { href: "/admin/pending-changes", label: "Chờ duyệt", icon: "M12 8v4l3 3M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" },
    ],
  },
  { href: "/admin/audit-log", label: "Nhật ký hành động", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 14h6M9 18h4" },
];

// Tim nhan (label) breadcrumb khop voi pathname hien tai - kiem tra ca muc con
// trong group truoc (khop dai hon/cu the hon), sau do moi den muc cap 1.
const EXTRA_BREADCRUMB_LABELS: Record<string, string> = {
  "/admin/settings": "Cài đặt",
  "/admin/page-seo": "SEO các trang",
  "/admin/giao-dien": "Giao diện & Lễ hội",
  "/admin/account": "Tài khoản của tôi",
};

export function findBreadcrumbLabel(pathname: string): string {
  for (const [href, label] of Object.entries(EXTRA_BREADCRUMB_LABELS)) {
    if (pathname === href || pathname.startsWith(href + "/")) return label;
  }
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
  "/admin/stay-booking-inquiries": "homestay",
  "/admin/lich-dat": "homestay",
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
  "/admin/sale-tasks": "sale-agents",
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
  "/admin/password-reset-requests": "password-reset-requests",
  "/admin/rental-inquiries": "car-rentals",
  "/admin/forum-comments": "forum-comments",
  "/admin/user-reviews": "forum-comments",
  "/admin/settings": "settings",
  "/admin/page-seo": "settings",
  "/admin/guide-videos": "guide-videos",
};

// Cac trang CHI SuperAdmin duoc vao (khong nam trong he thong quyen theo muc). Dung o
// proxy.ts (chan ca dieu huong mem) va layout. Khop chinh xac hoac theo thu muc con -
// "/admin/forum" khong duoc khop nham "/admin/forum-comments".
const SUPER_ONLY_PATHS = [
  "/admin/staff",
  "/admin/pending-changes",
  "/admin/audit-log",
  "/admin/sheet-sync",
  "/admin/users",
  "/admin/forum",
  "/admin/giao-dien",
  "/admin/bao-cao", // doanh thu + xuất danh sách khách: chỉ SuperAdmin
];

export function isSuperOnlyPath(pathname: string): boolean {
  return SUPER_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// Muc quyen cua 1 duong dan (khop dai nhat truoc), null neu khong thuoc he thong quyen.
export function sectionForPath(pathname: string): import("@/lib/admin-permissions").SectionKey | null {
  let best: string | null = null;
  for (const href of Object.keys(HREF_TO_SECTION)) {
    if ((pathname === href || pathname.startsWith(href + "/")) && (!best || href.length > best.length)) best = href;
  }
  return best ? HREF_TO_SECTION[best] : null;
}

// Trang dau tien nhan vien duoc phep vao (dung khi bi chuyen huong ra khoi trang khong co quyen).
export function firstAccessibleHref(
  hasAccess: (section: import("@/lib/admin-permissions").SectionKey) => boolean
): string {
  for (const item of NAV) {
    const links = isGroup(item) ? item.children : [item];
    for (const link of links) {
      const section = HREF_TO_SECTION[link.href];
      if (section && hasAccess(section)) return link.href;
    }
  }
  return "/admin/account";
}

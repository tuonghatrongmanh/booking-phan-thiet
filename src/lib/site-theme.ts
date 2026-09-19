import { prisma } from "@/lib/prisma";
import { deriveThemeVars } from "@/lib/theme-colors";

// Giao dien theo dip le (Tet, Trung thu, Quoc khanh...) - xem model SiteTheme. Giao dien
// "default" KHONG ghi de gi (dung nguyen bang mau trong :root cua globals.css); cac giao
// dien khac ghi de bien --theme-* tren <html> (layout.tsx) nen moi component doi mau theo.
export const DEFAULT_THEME_KEY = "default";

export const BUILTIN_THEMES = [
  {
    key: "default",
    name: "Mặc định - Biển xanh",
    description: "Giao diện xanh biển thương hiệu (#003B95) dùng quanh năm.",
    primary: "#003b95",
    sortOrder: 0,
  },
  {
    key: "tet",
    name: "Tết Nguyên Đán",
    description: "Đỏ may mắn - vàng hoa mai, không khí đón xuân. Tải ảnh hero/header do bạn thiết kế để hoàn thiện.",
    primary: "#b3121d",
    secondary: "#e8a317",
    heroOverlay: "#c8102e",
    heroOverlayOpacity: 10,
    sortOrder: 1,
  },
  {
    key: "trung-thu",
    name: "Tết Trung thu",
    description: "Tím đêm trăng + cam đèn lồng, ấm áp cho mùa đoàn viên.",
    primary: "#5b2e91",
    secondary: "#e8871e",
    heroOverlay: "#2a1466",
    heroOverlayOpacity: 12,
    sortOrder: 2,
  },
  {
    key: "quoc-khanh",
    name: "Quốc khánh 2/9",
    description: "Đỏ cờ - vàng sao, rực rỡ ngày Quốc khánh.",
    primary: "#c8102e",
    secondary: "#f2b705",
    heroOverlay: "#c8102e",
    heroOverlayOpacity: 8,
    sortOrder: 3,
  },
] as const;

export type ActiveTheme = {
  key: string;
  name: string;
  primary: string;
  vars: Record<string, string>;
  heroImage: string | null;
  headerImage: string | null;
  footerImage: string | null;
};

const DEFAULT_ACTIVE: ActiveTheme = {
  key: DEFAULT_THEME_KEY,
  name: "Mặc định",
  primary: "#003b95",
  vars: {},
  heroImage: null,
  headerImage: null,
  footerImage: null,
};

// Bo nho dem ngan (10s) trong tien trinh: moi request deu can biet giao dien nhung khong can
// truy van DB moi lan; admin doi giao dien thi xoa cache ngay (invalidateThemeCache).
const TTL_MS = 10_000;
// Luu tren globalThis: route handler (admin doi giao dien) va trang render co the la 2 ban module khac nhau
// trong Next.js, bien module rieng le se khong bi xoa cache dung luc.
const g = globalThis as unknown as { __bptThemeCache?: { at: number; value: ActiveTheme } | null };

export function invalidateThemeCache() {
  g.__bptThemeCache = null;
}

export async function getActiveTheme(): Promise<ActiveTheme> {
  const hit = g.__bptThemeCache;
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  let value = DEFAULT_ACTIVE;
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { activeThemeKey: true } });
    const key = settings?.activeThemeKey;
    if (key && key !== DEFAULT_THEME_KEY) {
      const t = await prisma.siteTheme.findUnique({ where: { key } });
      if (t) {
        value = {
          key: t.key,
          name: t.name,
          primary: t.primary,
          vars: deriveThemeVars(t),
          heroImage: t.heroImage,
          headerImage: t.headerImage,
          footerImage: t.footerImage,
        };
      }
    }
  } catch (err) {
    console.error("[site-theme] Không đọc được giao diện, dùng mặc định:", err);
  }
  g.__bptThemeCache = { at: Date.now(), value };
  return value;
}

// Tao cac giao dien co san (Tet/Trung thu/Quoc khanh...) neu chua co - KHONG ghi de gi admin
// da chinh sua (skipDuplicates chi them dong thieu).
export async function ensureBuiltinThemes() {
  await prisma.siteTheme.createMany({
    data: BUILTIN_THEMES.map((t) => ({ ...t, builtin: true })),
    skipDuplicates: true,
  });
}

// Ghep URL anh vao CSS background-image an toan: encodeURI ma hoa dau nhay kep, backslash,
// xuong dong thanh %22/%5C/%0A nen gia tri khong the thoat khoi url("...") (URL da duoc kiem
// tra o API - day la lop phong thu them). decodeURI truoc de khong ma hoa 2 lan "%20".
export function cssUrl(u: string): string {
  let safe: string;
  try {
    safe = encodeURI(decodeURI(u));
  } catch {
    safe = encodeURI(u);
  }
  return `url("${safe}")`;
}

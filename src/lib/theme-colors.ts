// Tinh bo bien mau --theme-* tu 1-3 mau admin chon. Ham thuan (khong I/O) de test duoc.
// Quy uoc lay theo bang mau goc #003b95 dang dung: dam = L*0.72, sang = L+0.17 (giam bao hoa
// nhe), cac sac nhat = tron voi mau trang, footer = L*0.52.
export const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function isHex(v: unknown): v is string {
  return typeof v === "string" && HEX_RE.test(v);
}

type RGB = [number, number, number];
type HSL = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: RGB): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function rgbToHsl([r, g, b]: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb([h, s, l]: HSL): RGB {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = h / 360;
  const f = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return [f(hk + 1 / 3) * 255, f(hk) * 255, f(hk - 1 / 3) * 255];
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function adjust(hex: string, lFactor: number, lAdd: number, sFactor: number): string {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb([h, clamp01(s * sFactor), clamp01(l * lFactor + lAdd)]));
}

// Giu nguyen sac do (hue), keo bao hoa vao khoang [sMin,sMax] roi dat do sang l: cho ra cac
// nen nhat "co mau" (khong bi xam nhu khi tron thang voi trang) giong bang mau goc.
function tone(hex: string, sMin: number, sMax: number, l: number): string {
  const [h, s] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb([h, Math.max(sMin, Math.min(sMax, s)), l]));
}

// Tron `hex` voi mau trang: amount = ti le mau trang (0 = giu nguyen, 1 = trang tinh)
export function mixWithWhite(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex([r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount]);
}

function luminance(hex: string): number {
  const lin = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

// Do tuong phan cua chu TRANG tren nen `hex` (WCAG). >= 4.5 la doc tot.
export function contrastWithWhite(hex: string): number {
  return 1.05 / (luminance(hex) + 0.05);
}

export type ThemeColorInput = {
  primary: string;
  secondary?: string | null;
  footerColor?: string | null;
  heroOverlay?: string | null;
  heroOverlayOpacity?: number;
};

export function deriveThemeVars(t: ThemeColorInput): Record<string, string> {
  const p = t.primary;
  const dark = adjust(p, 0.72, 0, 1);
  const light = adjust(p, 1, 0.17, 0.78);
  const overlayA = clamp01((t.heroOverlayOpacity ?? 0) / 100);
  return {
    "--theme-primary": p,
    "--theme-primary-dark": dark,
    "--theme-primary-light": light,
    "--theme-primary-mid": tone(p, 0.35, 0.7, 0.87),
    "--theme-primary-soft": tone(p, 0.35, 0.75, 0.95),
    "--theme-primary-tint": tone(p, 0.3, 0.65, 0.975),
    "--theme-footer": t.footerColor && isHex(t.footerColor) ? t.footerColor : adjust(p, 0.52, 0, 1),
    "--theme-hero-from": tone(p, 0.35, 0.7, 0.9),
    "--theme-hero-via": tone(p, 0.35, 0.75, 0.95),
    "--theme-hero-to": tone(p, 0.3, 0.65, 0.985),
    "--theme-navbar-from": dark,
    "--theme-navbar-via": p,
    "--theme-navbar-to": t.secondary && isHex(t.secondary) ? t.secondary : light,
    "--theme-hero-overlay":
      t.heroOverlay && isHex(t.heroOverlay) && overlayA > 0
        ? `rgba(${hexToRgb(t.heroOverlay).join(",")},${overlayA.toFixed(2)})`
        : "transparent",
  };
}

// Bang mau MAC DINH, khop tung gia tri trong :root cua globals.css. Dung de (1) khu vuc admin
// luon giu mau goc du site dang doi giao dien le hoi, (2) ban xem truoc giao dien "Mac dinh".
export const DEFAULT_THEME_VARS: Record<string, string> = {
  "--theme-primary": "#003b95",
  "--theme-primary-dark": "#002a6b",
  "--theme-primary-light": "#1f5fcf",
  "--theme-primary-mid": "#c8d8f2",
  "--theme-primary-soft": "#e8f0fb",
  "--theme-primary-tint": "#f4f8fd",
  "--theme-footer": "#001c4d",
  "--theme-hero-from": "#d3e2f7",
  "--theme-hero-via": "#e8f0fb",
  "--theme-hero-to": "#f7faff",
  "--theme-navbar-from": "#002a70",
  "--theme-navbar-via": "#003b95",
  "--theme-navbar-to": "#0a4fb8",
  "--theme-hero-overlay": "transparent",
};

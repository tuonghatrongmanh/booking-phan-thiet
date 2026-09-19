import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";
import { contrastWithWhite, HEX_RE } from "@/lib/theme-colors";

const hex = z.string().regex(HEX_RE, "Mã màu phải có dạng #rrggbb");
const optHex = hex.optional().or(z.literal("")).nullable();

// Anh: duong dan noi bo "/..." (khong phai "//") hoac https - imagePathSchema cho phep ca http va "//" nen siet lai
const safeImage = imagePathSchema.refine(
  (v) => (v.startsWith("/") && !v.startsWith("//")) || v.startsWith("https://"),
  "Ảnh phải là đường dẫn nội bộ hoặc https"
);
const img = safeImage.optional().or(z.literal("")).nullable();

export const themeFieldsSchema = z.object({
  name: z.string().trim().min(2, "Tên giao diện tối thiểu 2 ký tự").max(60),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  primary: hex.refine((c) => contrastWithWhite(c) >= 4.5, "Màu chủ đạo quá sáng, chữ trắng trên nút sẽ khó đọc - hãy chọn màu đậm hơn"),
  secondary: optHex,
  footerColor: optHex,
  heroOverlay: optHex,
  heroOverlayOpacity: z.number().int().min(0).max(60).optional(),
  previewImage: img,
  heroImage: img,
  headerImage: img,
  footerImage: img,
});

export const themeUpdateSchema = themeFieldsSchema.partial();
export const activateSchema = z.object({ key: z.string().trim().min(1).max(60) });
export const slotSchema = z.object({ imageUrl: safeImage });

// Chuoi rong -> null de luu DB (giong quy uoc cua SettingsForm)
export function emptyToNull<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])) as T;
}

export function slugifyKey(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "giao-dien";
}

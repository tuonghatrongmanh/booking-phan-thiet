import { absoluteUrl } from "@/lib/site-url";

// Ảnh xem trước khi dán link vào Zalo/Facebook/Messenger... (chuẩn 1200x630).
// Trang nào có ảnh riêng (bìa bài viết, ảnh homestay...) thì dùng ảnh đó, không có thì dùng ảnh thương hiệu.
// Muốn đổi ảnh thương hiệu: thay file public/images/og-image.jpg (giữ tên, 1200x630, dưới 300KB).
export const DEFAULT_OG_IMAGE = "/images/og-image.jpg";
export const OG_ALT = "Booking Phan Thiết - Tra cứu thông tin uy tín, minh bạch, an tâm du lịch";

export function ogImages(image?: string | null): { url: string; width?: number; height?: number; alt: string }[] {
  if (image) return [{ url: absoluteUrl(image)!, alt: OG_ALT }];
  return [{ url: absoluteUrl(DEFAULT_OG_IMAGE)!, width: 1200, height: 630, alt: OG_ALT }];
}

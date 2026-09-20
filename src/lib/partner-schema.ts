import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";

// Phần THUẦN của Cổng đối tác (không đụng DB) - tách riêng để test và để component client import an toàn.
// Chủ homestay / chủ xe chỉ được đề xuất sửa các trường dưới đây; mọi thay đổi chờ SuperAdmin duyệt.
export const PARTNER_CATEGORIES = ["HOMESTAY", "CAR_RENTAL"] as const;

const vnPhone = /^(0|\+84)[35789][0-9]{8}$/;

// Chỉ những trường này đối tác được đề xuất sửa. Tiền cọc, địa chỉ/bản đồ, trạng thái uy tín... chỉ admin đổi.
export const partnerChangeSchema = z
  .object({
    description: z.string().trim().min(1).max(3000).optional(),
    priceFromVnd: z.number().int().min(0).max(100_000_000).optional(),
    priceHolidayVnd: z.number().int().min(0).max(100_000_000).optional(),
    phone: z.string().trim().regex(vnPhone, "Số điện thoại không hợp lệ").optional(),
    avatar: imagePathSchema.optional(),
    addImages: z.array(imagePathSchema).min(1).max(8).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Hãy nhập ít nhất một thay đổi");

export type PartnerChange = z.infer<typeof partnerChangeSchema>;

export const FIELD_LABELS: Record<keyof PartnerChange, string> = {
  description: "Mô tả",
  priceFromVnd: "Giá từ (đ)",
  priceHolidayVnd: "Giá ngày lễ (đ)",
  phone: "Số điện thoại liên hệ",
  avatar: "Ảnh đại diện",
  addImages: "Ảnh thêm vào thư viện",
};


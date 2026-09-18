import { z } from "zod";

// Dữ liệu 1 "gói đặt phòng" của homestay (phòng đơn/phòng đôi/nguyên căn...).
// Tách riêng khỏi route.ts vì Next.js chỉ cho route file export GET/POST/...
export const optionSchema = z.object({
  label: z.string().trim().min(1, "Vui lòng nhập tên gói").max(60),
  depositVnd: z.number().int().min(10_000, "Tiền cọc tối thiểu 10.000đ").max(50_000_000, "Tiền cọc tối đa 50.000.000đ"),
  priceVnd: z.number().int().min(0).max(100_000_000).nullable().optional(),
  maxUnits: z.number().int().min(1, "Số phòng tối thiểu là 1").max(200),
  wholeProperty: z.boolean().optional().default(false),
});

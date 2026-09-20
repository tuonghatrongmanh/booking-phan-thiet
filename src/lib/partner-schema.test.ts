import { describe, expect, it } from "vitest";
import { partnerChangeSchema } from "./partner-schema";

describe("partnerChangeSchema", () => {
  it("nhận các thay đổi hợp lệ", () => {
    const r = partnerChangeSchema.safeParse({ priceFromVnd: 500000, description: "Mô tả mới", phone: "0901234567", addImages: ["/uploads/a.jpg"] });
    expect(r.success).toBe(true);
  });

  it("từ chối payload rỗng", () => {
    expect(partnerChangeSchema.safeParse({}).success).toBe(false);
  });

  it("từ chối trường ngoài danh sách cho phép (tiền cọc, trạng thái uy tín, ẩn/hiện...)", () => {
    for (const bad of [{ depositVnd: 1000000 }, { status: "TRUSTED" }, { hidden: false }, { partnerUserId: "x" }, { priceFromVnd: 1, category: "SALE" }]) {
      expect(partnerChangeSchema.safeParse(bad).success, JSON.stringify(bad)).toBe(false);
    }
  });

  it("kiểm tra số điện thoại, giá và số ảnh", () => {
    expect(partnerChangeSchema.safeParse({ phone: "12345" }).success).toBe(false);
    expect(partnerChangeSchema.safeParse({ priceFromVnd: -1 }).success).toBe(false);
    expect(partnerChangeSchema.safeParse({ priceFromVnd: 1.5 }).success).toBe(false);
    expect(partnerChangeSchema.safeParse({ addImages: Array(9).fill("/a.jpg") }).success).toBe(false);
    expect(partnerChangeSchema.safeParse({ avatar: "javascript:alert(1)" }).success).toBe(false);
  });
});

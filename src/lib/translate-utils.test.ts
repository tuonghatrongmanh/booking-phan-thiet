import { describe, expect, it } from "vitest";
import { needsTranslation, normalizeText, splitBatches, withOuterSpace } from "./translate-utils";

describe("needsTranslation", () => {
  it("nhận chuỗi có dấu tiếng Việt", () => {
    expect(needsTranslation("Lưu trú")).toBe(true);
    expect(needsTranslation("  Đặt phòng ngay  ")).toBe(true);
  });
  it("bỏ chuỗi tiếng Anh/ký hiệu/giá tiền/quá ngắn", () => {
    expect(needsTranslation("Facebook")).toBe(false);
    expect(needsTranslation("450.000đ")).toBe(false);
    expect(needsTranslation("12/9/2026")).toBe(false);
    expect(needsTranslation("đ")).toBe(false);
    expect(needsTranslation("")).toBe(false);
  });
  it("bỏ chuỗi quá dài", () => {
    expect(needsTranslation("ế".repeat(700))).toBe(false);
  });
});

describe("splitBatches", () => {
  it("chia theo số lượng và tổng ký tự", () => {
    const items = Array.from({ length: 120 }, (_, i) => `câu ${i}`);
    const batches = splitBatches(items, 50, 6000);
    expect(batches.map((b) => b.length)).toEqual([50, 50, 20]);
    expect(splitBatches(["a".repeat(4000), "b".repeat(4000)], 50, 6000)).toHaveLength(2);
  });
});

describe("helpers", () => {
  it("chuẩn hóa khoảng trắng", () => {
    expect(normalizeText("  a \n b  ")).toBe("a b");
  });
  it("giữ khoảng trắng đầu/cuối khi thay bản dịch", () => {
    expect(withOuterSpace("  Lưu trú\n", "Stay")).toBe("  Stay\n");
  });
});

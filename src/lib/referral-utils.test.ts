import { describe, expect, it } from "vitest";
import { computeCommission, generateReferralCode, maskName, normalizeRefCode, referralLink } from "./referral-utils";

describe("referral code", () => {
  it("sinh mã 7 ký tự, không có ký tự dễ nhầm, khớp định dạng hợp lệ", () => {
    for (let i = 0; i < 200; i++) {
      const c = generateReferralCode();
      expect(c).toHaveLength(7);
      expect(c).toMatch(/^[A-HJ-NP-Z2-9]+$/);
      expect(normalizeRefCode(c)).toBe(c);
    }
  });

  it("chuẩn hóa chữ hoa/thường và loại giá trị lạ (tránh nhét ký tự lạ vào cookie)", () => {
    expect(normalizeRefCode(" ab3cd9x ")).toBe("AB3CD9X");
    expect(normalizeRefCode("<script>")).toBeNull();
    expect(normalizeRefCode("AB")).toBeNull();
    expect(normalizeRefCode(null)).toBeNull();
    expect(normalizeRefCode("A".repeat(11))).toBeNull();
  });
});

describe("computeCommission", () => {
  it("5% tiền cọc, làm tròn đồng", () => {
    expect(computeCommission(100000, 5)).toBe(5000);
    expect(computeCommission(150000, 5)).toBe(7500);
    expect(computeCommission(33333, 5)).toBe(1667);
  });
  it("không có cọc hoặc 0% -> 0", () => {
    expect(computeCommission(0, 5)).toBe(0);
    expect(computeCommission(100000, 0)).toBe(0);
    expect(computeCommission(NaN, 5)).toBe(0);
  });
});

describe("maskName / referralLink", () => {
  it("rút gọn tên khách", () => {
    expect(maskName("Nguyễn Văn An")).toBe("Nguyễn V. A.");
    expect(maskName("An")).toBe("A***");
    expect(maskName("  ")).toBe("Khách");
  });
  it("ghép link giới thiệu", () => {
    expect(referralLink("https://bookingphanthiet.com/", "AB3CD9X")).toBe("https://bookingphanthiet.com/?ref=AB3CD9X");
  });
});

import { effectivePercent } from "./referral-utils";

describe("effectivePercent (tỉ lệ riêng của từng Sale)", () => {
  it("dùng mức riêng nếu có, kể cả 0%", () => {
    expect(effectivePercent(8, 5)).toBe(8);
    expect(effectivePercent(0, 5)).toBe(0);
  });
  it("không có mức riêng (null/undefined) thì dùng mức chung", () => {
    expect(effectivePercent(null, 5)).toBe(5);
    expect(effectivePercent(undefined, 7)).toBe(7);
  });
});

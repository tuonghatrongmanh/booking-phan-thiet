import { describe, expect, it } from "vitest";
import { contrastWithWhite, deriveThemeVars, hexToRgb, isHex, mixWithWhite, rgbToHex } from "./theme-colors";

describe("hex helpers", () => {
  it("nhận đúng định dạng #rrggbb", () => {
    expect(isHex("#003b95")).toBe(true);
    expect(isHex("003b95")).toBe(false);
    expect(isHex("#fff")).toBe(false);
    expect(isHex("url(javascript:1)")).toBe(false);
  });

  it("chuyển đổi hex <-> rgb khứ hồi", () => {
    expect(rgbToHex(hexToRgb("#c8102e"))).toBe("#c8102e");
  });

  it("trộn với trắng", () => {
    expect(mixWithWhite("#000000", 0.5)).toBe("#808080");
    expect(mixWithWhite("#003b95", 0)).toBe("#003b95");
    expect(mixWithWhite("#003b95", 1)).toBe("#ffffff");
  });
});

describe("contrastWithWhite", () => {
  it("nền tối đọc tốt, nền vàng nhạt đọc kém", () => {
    expect(contrastWithWhite("#003b95")).toBeGreaterThan(8);
    expect(contrastWithWhite("#ffd400")).toBeLessThan(2);
  });
});

describe("deriveThemeVars", () => {
  const vars = deriveThemeVars({ primary: "#003b95" });

  it("gần với bảng màu gốc: đậm hơn, sáng hơn, nhạt dần", () => {
    // bang mau goc: dark #002a6b, mid #c8d8f2, soft #e8f0fb, footer #001c4d
    expect(vars["--theme-primary"]).toBe("#003b95");
    const [dr, dg, db] = hexToRgb(vars["--theme-primary-dark"]);
    expect(dr).toBeLessThan(5);
    expect(Math.abs(dg - 0x2a)).toBeLessThan(6);
    expect(Math.abs(db - 0x6b)).toBeLessThan(8);
    const near = (hex: string, ref: string, tol: number) =>
      hexToRgb(hex).every((v, i) => Math.abs(v - hexToRgb(ref)[i]) <= tol);
    expect(near(vars["--theme-primary-mid"], "#c8d8f2", 12)).toBe(true);
    expect(near(vars["--theme-primary-soft"], "#e8f0fb", 8)).toBe(true);
    expect(near(vars["--theme-primary-tint"], "#f4f8fd", 8)).toBe(true);
    const [, fg, fb] = hexToRgb(vars["--theme-footer"]);
    expect(Math.abs(fg - 0x1c)).toBeLessThan(6);
    expect(Math.abs(fb - 0x4d)).toBeLessThan(8);
  });

  it("dùng mau phụ cho cuối dải header và mau footer riêng khi có", () => {
    const v = deriveThemeVars({ primary: "#c8102e", secondary: "#f5a300", footerColor: "#3a0008" });
    expect(v["--theme-navbar-to"]).toBe("#f5a300");
    expect(v["--theme-footer"]).toBe("#3a0008");
  });

  it("lớp phủ hero chỉ bật khi có màu và độ mờ > 0", () => {
    expect(deriveThemeVars({ primary: "#003b95" })["--theme-hero-overlay"]).toBe("transparent");
    expect(deriveThemeVars({ primary: "#003b95", heroOverlay: "#c8102e", heroOverlayOpacity: 0 })["--theme-hero-overlay"]).toBe("transparent");
    expect(deriveThemeVars({ primary: "#003b95", heroOverlay: "#c8102e", heroOverlayOpacity: 15 })["--theme-hero-overlay"]).toBe("rgba(200,16,46,0.15)");
  });

  it("bỏ qua giá trị màu không hợp lệ (chống chèn CSS)", () => {
    const v = deriveThemeVars({ primary: "#003b95", secondary: "red;}body{display:none", footerColor: "javascript:1" });
    expect(v["--theme-navbar-to"]).not.toContain("red");
    expect(v["--theme-footer"]).toMatch(/^#[0-9a-f]{6}$/);
  });
});

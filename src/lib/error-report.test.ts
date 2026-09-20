import { describe, expect, it } from "vitest";
import { formatErrorAlert, shouldReportError } from "./error-report";

describe("shouldReportError", () => {
  it("bỏ qua chuyển hướng / 404 / lỗi động của Next", () => {
    expect(shouldReportError(Object.assign(new Error("x"), { digest: "NEXT_REDIRECT;replace;/a;307" }))).toBe(false);
    expect(shouldReportError(Object.assign(new Error("x"), { digest: "NEXT_HTTP_ERROR_FALLBACK;404" }))).toBe(false);
    expect(shouldReportError(new Error("Dynamic server usage: headers"))).toBe(false);
  });

  it("báo lỗi thật", () => {
    expect(shouldReportError(new Error("Cannot read properties of undefined"))).toBe(true);
    expect(shouldReportError("chuỗi lỗi lạ")).toBe(true);
  });
});

describe("formatErrorAlert", () => {
  it("bỏ query string (có thể chứa thông tin cá nhân) và escape HTML", () => {
    const text = formatErrorAlert(new Error("<b>boom</b> & co"), { path: "/tra-cuu-dat-cho?phone=0901234567", method: "GET" }, { routePath: "/tra-cuu-dat-cho", routeType: "render" });
    expect(text).not.toContain("0901234567");
    expect(text).toContain("GET /tra-cuu-dat-cho");
    expect(text).toContain("&lt;b&gt;boom&lt;/b&gt; &amp; co");
  });
});

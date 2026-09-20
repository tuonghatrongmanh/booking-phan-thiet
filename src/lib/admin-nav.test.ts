import { describe, expect, it } from "vitest";
import { firstAccessibleHref, isSuperOnlyPath, sectionForPath } from "./admin-nav";

describe("isSuperOnlyPath", () => {
  it("chặn các trang chỉ dành cho SuperAdmin, kể cả trang con", () => {
    for (const p of ["/admin/staff", "/admin/staff/new", "/admin/users", "/admin/forum", "/admin/forum/new", "/admin/sheet-sync/abc", "/admin/audit-log", "/admin/pending-changes", "/admin/giao-dien"]) {
      expect(isSuperOnlyPath(p), p).toBe(true);
    }
  });

  it("không khớp nhầm tiền tố giống tên (forum-comments khác forum)", () => {
    expect(isSuperOnlyPath("/admin/forum-comments")).toBe(false);
    expect(isSuperOnlyPath("/admin/staffing")).toBe(false);
  });

  it("các trang nhân viên được vào theo quyền mục thì không bị chặn cứng", () => {
    for (const p of ["/admin/news", "/admin/banners/new", "/admin/account", "/admin/settings"]) {
      expect(isSuperOnlyPath(p), p).toBe(false);
    }
  });
});

describe("sectionForPath", () => {
  it("map đường dẫn sang mục quyền, khớp dài nhất", () => {
    expect(sectionForPath("/admin/news")).toBe("tin-tuc");
    expect(sectionForPath("/admin/news/abc/edit")).toBe("tin-tuc");
    expect(sectionForPath("/admin/sale-tasks")).toBe("sale-agents");
    expect(sectionForPath("/admin/stay-booking-inquiries")).toBe("homestay");
    expect(sectionForPath("/admin/page-seo")).toBe("settings");
  });

  it("trang không thuộc hệ thống quyền -> null", () => {
    expect(sectionForPath("/admin/account")).toBeNull();
    expect(sectionForPath("/admin")).toBeNull();
  });
});

describe("firstAccessibleHref", () => {
  it("trả về trang đầu tiên có quyền, hoặc trang tài khoản khi không có gì", () => {
    expect(firstAccessibleHref((s) => s === "banners")).toBe("/admin/banners");
    expect(firstAccessibleHref(() => true)).toBe("/admin/messages");
    expect(firstAccessibleHref(() => false)).toBe("/admin/account");
  });
});

describe("báo cáo & lịch đặt", () => {
  it("báo cáo doanh thu chỉ dành cho SuperAdmin, lịch đặt theo quyền Lưu trú", () => {
    expect(isSuperOnlyPath("/admin/bao-cao")).toBe(true);
    expect(isSuperOnlyPath("/admin/lich-dat")).toBe(false);
    expect(sectionForPath("/admin/lich-dat")).toBe("homestay");
  });
});

describe("hoa hồng Sale & yêu cầu đối tác", () => {
  it("chỉ SuperAdmin được vào (có tiền và dữ liệu khách)", () => {
    expect(isSuperOnlyPath("/admin/hoa-hong")).toBe(true);
    expect(isSuperOnlyPath("/admin/yeu-cau-doi-tac")).toBe(true);
  });
});

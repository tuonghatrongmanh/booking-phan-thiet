import { describe, expect, it } from "vitest";
import { formatWindow, isWindowActive, pickScheduledTheme, todayInVietnam } from "./theme-schedule";

const w = (startDate: string, endDate: string, repeatYearly = false) => ({ startDate, endDate, repeatYearly });

describe("isWindowActive", () => {
  it("khoảng cố định: gồm cả ngày đầu và ngày cuối", () => {
    expect(isWindowActive("2026-09-18", w("2026-09-18", "2026-09-27"))).toBe(true);
    expect(isWindowActive("2026-09-27", w("2026-09-18", "2026-09-27"))).toBe(true);
    expect(isWindowActive("2026-09-28", w("2026-09-18", "2026-09-27"))).toBe(false);
    expect(isWindowActive("2027-09-20", w("2026-09-18", "2026-09-27"))).toBe(false);
  });

  it("lặp hằng năm: chỉ so sánh tháng-ngày", () => {
    const qk = w("2001-08-25", "2001-09-03", true);
    expect(isWindowActive("2030-08-30", qk)).toBe(true);
    expect(isWindowActive("2030-09-04", qk)).toBe(false);
  });

  it("lặp hằng năm và vắt qua năm mới", () => {
    const xmas = w("2001-12-20", "2001-01-05", true);
    expect(isWindowActive("2026-12-25", xmas)).toBe(true);
    expect(isWindowActive("2027-01-03", xmas)).toBe(true);
    expect(isWindowActive("2027-02-01", xmas)).toBe(false);
  });

  it("thiếu ngày hoặc sai định dạng -> không bao giờ trúng lịch", () => {
    expect(isWindowActive("2026-09-20", { startDate: null, endDate: "2026-09-27", repeatYearly: false })).toBe(false);
    expect(isWindowActive("2026-09-20", w("18/09/2026", "27/09/2026"))).toBe(false);
  });
});

describe("pickScheduledTheme", () => {
  it("chọn khoảng ngắn (cụ thể) nhất khi nhiều giao diện cùng trúng", () => {
    const wide = { key: "rong", ...w("2026-09-01", "2026-09-30") };
    const narrow = { key: "hep", ...w("2026-09-18", "2026-09-27") };
    expect(pickScheduledTheme([wide, narrow], "2026-09-20")?.key).toBe("hep");
  });

  it("không giao diện nào trúng lịch -> null (dùng mặc định)", () => {
    expect(pickScheduledTheme([{ key: "a", ...w("2026-01-01", "2026-01-10") }], "2026-09-20")).toBeNull();
  });
});

describe("todayInVietnam / formatWindow", () => {
  it("tính ngày theo giờ Việt Nam (UTC+7), không theo UTC", () => {
    expect(todayInVietnam(new Date("2026-09-20T18:30:00Z"))).toBe("2026-09-21");
    expect(todayInVietnam(new Date("2026-09-20T16:30:00Z"))).toBe("2026-09-20");
  });

  it("hiển thị khoảng ngày dễ đọc", () => {
    expect(formatWindow(w("2001-08-25", "2001-09-03", true))).toBe("25/08 - 03/09 (hằng năm)");
    expect(formatWindow(w("2027-01-23", "2027-02-14"))).toBe("23/01/2027 - 14/02/2027");
    expect(formatWindow({ startDate: null, endDate: null, repeatYearly: false })).toBeNull();
  });
});

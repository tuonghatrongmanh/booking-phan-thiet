import { describe, expect, it } from "vitest";
import { describeWeatherCode, formatSerperContext, formatWeatherContext, formatWikiContext, WEATHER_RE } from "./web-lookup";

describe("formatWeatherContext", () => {
  it("định dạng dự báo từng ngày bằng tiếng Việt", () => {
    const text = formatWeatherContext({
      current: { temperature_2m: 30.4, weather_code: 2 },
      daily: {
        time: ["2026-09-19", "2026-09-20"],
        weather_code: [80, 0],
        temperature_2m_max: [31.2, 33],
        temperature_2m_min: [25.1, 26],
        precipitation_probability_max: [70, 10],
        wind_speed_10m_max: [18.4, 12],
      },
    });
    expect(text).toContain("Thứ bảy 19/09: mưa rào, 25-31°C, khả năng mưa 70%");
    expect(text).toContain("Chủ nhật 20/09: trời quang");
    expect(text).toContain("Hiện tại: 30°C, ít mây");
  });

  it("không có dữ liệu ngày thì trả null", () => {
    expect(formatWeatherContext({})).toBeNull();
  });

  it("mã lạ có mô tả mặc định", () => {
    expect(describeWeatherCode(999)).toBe("thời tiết thay đổi");
  });
});

describe("formatSerperContext", () => {
  it("chỉ lấy link https và đánh số nguồn", () => {
    const ctx = formatSerperContext({
      organic: [
        { title: "Báo A", link: "https://a.vn/x", snippet: "nội dung a" },
        { title: "Xấu", link: "javascript:alert(1)", snippet: "x" },
        { title: "Báo B", link: "https://b.vn/y", snippet: "nội dung b" },
      ],
    });
    expect(ctx?.sources.map((s) => s.uri)).toEqual(["https://a.vn/x", "https://b.vn/y"]);
    expect(ctx?.text).toContain("[2] Báo B");
  });

  it("rỗng thì null", () => {
    expect(formatSerperContext({})).toBeNull();
  });
});

describe("formatWikiContext", () => {
  it("sắp theo thứ hạng tìm kiếm và tạo link curid", () => {
    const ctx = formatWikiContext({
      query: {
        pages: {
          "2": { pageid: 2, title: "B", extract: "bbb", index: 2 },
          "1": { pageid: 1, title: "A", extract: "aaa", index: 1 },
          "3": { pageid: 3, title: "Không nội dung" },
        },
      },
    });
    expect(ctx?.sources.map((s) => s.uri)).toEqual(["https://vi.wikipedia.org/?curid=1", "https://vi.wikipedia.org/?curid=2"]);
  });
});

describe("WEATHER_RE", () => {
  it("nhận ra câu hỏi thời tiết", () => {
    expect(WEATHER_RE.test("Cuối tuần này Phan Thiết có mưa không?")).toBe(true);
    expect(WEATHER_RE.test("Homestay nào đẹp?")).toBe(false);
  });
});

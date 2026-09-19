import { describe, expect, it } from "vitest";
import { extractSearchPhrases, extractSources, sanitizeTurns, takeGroundingSlot } from "./ai-chat-utils";

describe("sanitizeTurns", () => {
  it("giữ tối đa 10 lượt gần nhất, bắt đầu và kết thúc bằng lượt của khách", () => {
    const input = Array.from({ length: 14 }, (_, i) => ({ role: i % 2 === 0 ? "user" : "model", text: `tin ${i}` }));
    const out = sanitizeTurns(input);
    expect(out.length).toBeLessThanOrEqual(10);
    expect(out[0].role).toBe("user");
    expect(out[out.length - 1].role).toBe("user");
  });

  it("bỏ tin rỗng, cắt độ dài, ép vai trò lạ về user", () => {
    const out = sanitizeTurns([
      { role: "system", text: "  " },
      { role: "system", text: "x".repeat(2000) },
      { role: "user", text: 42 },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].role).toBe("user");
    expect(out[0].text.length).toBe(800);
  });

  it("không phải mảng thì trả về rỗng", () => {
    expect(sanitizeTurns("abc")).toEqual([]);
    expect(sanitizeTurns(null)).toEqual([]);
  });
});

describe("extractSources", () => {
  it("chỉ nhận link https, bỏ trùng tiêu đề, giới hạn số nguồn", () => {
    const out = extractSources({
      groundingChunks: [
        { web: { uri: "https://a.example/x", title: "Báo A" } },
        { web: { uri: "javascript:alert(1)", title: "Xấu" } },
        { web: { uri: "http://b.example", title: "Không https" } },
        { web: { uri: "https://c.example/y", title: "báo a" } },
        { web: { uri: "https://d.example/z" } },
      ],
    });
    expect(out.map((s) => s.title)).toEqual(["Báo A", "d.example"]);
  });

  it("không có metadata thì rỗng", () => {
    expect(extractSources(undefined)).toEqual([]);
  });
});

describe("extractSearchPhrases", () => {
  it("bỏ từ hỏi và tên vùng, giữ cụm từ khóa chính", () => {
    expect(extractSearchPhrases("Cho mình hỏi có homestay view biển ở Phan Thiết không?")).toEqual(["homestay view biển"]);
  });

  it("câu ngắn thì trả nguyên cụm còn lại", () => {
    expect(extractSearchPhrases("tôm hùm nướng")).toEqual(["tôm hùm nướng"]);
  });

  it("toàn từ hỏi thì rỗng", () => {
    expect(extractSearchPhrases("cho mình hỏi có không ạ")).toEqual([]);
  });
});

describe("takeGroundingSlot", () => {
  it("chặn khi vượt hạn mức trong ngày và tự reset khi sang ngày mới", () => {
    expect(takeGroundingSlot("2099-01-01", 2)).toBe(true);
    expect(takeGroundingSlot("2099-01-01", 2)).toBe(true);
    expect(takeGroundingSlot("2099-01-01", 2)).toBe(false);
    expect(takeGroundingSlot("2099-01-02", 2)).toBe(true);
  });
});

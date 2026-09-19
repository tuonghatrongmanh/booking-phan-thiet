import { describe, expect, it } from "vitest";
import { parseTiktokInput, videoIdFromStoredUrl } from "./tiktok-embed";

const EMBED = `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@minhquan/video/7412345678901234567" data-video-id="7412345678901234567" style="max-width: 605px;min-width: 325px;"><section></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;

describe("parseTiktokInput", () => {
  it("rút link + id từ mã nhúng", () => {
    expect(parseTiktokInput(EMBED)).toEqual({ url: "https://www.tiktok.com/@minhquan/video/7412345678901234567", videoId: "7412345678901234567" });
  });
  it("nhận link video thường, bỏ tham số theo dõi", () => {
    const r = parseTiktokInput("https://www.tiktok.com/@a/video/7412345678901234567?is_from_webapp=1&sender_device=pc");
    expect(r?.videoId).toBe("7412345678901234567");
    expect(r?.url).toBe("https://www.tiktok.com/@a/video/7412345678901234567");
  });
  it("link rút gọn vẫn nhận nhưng chưa có id", () => {
    const r = parseTiktokInput("https://vm.tiktok.com/ZSabc123/");
    expect(r?.videoId).toBeNull();
    expect(r?.url).toContain("vm.tiktok.com");
  });
  it("từ chối tên miền lạ, giao thức lạ, mã nhúng thiếu thông tin", () => {
    expect(parseTiktokInput("https://evil.com/@a/video/7412345678901234567")).toBeNull();
    expect(parseTiktokInput("javascript:alert(1)")).toBeNull();
    expect(parseTiktokInput('<blockquote cite="https://evil.com/x"></blockquote>')).toBeNull();
    expect(parseTiktokInput("")).toBeNull();
  });
  it("lấy id từ link đã lưu", () => {
    expect(videoIdFromStoredUrl("https://www.tiktok.com/@a/video/7412345678901234567")).toBe("7412345678901234567");
    expect(videoIdFromStoredUrl("https://vm.tiktok.com/ZSabc/")).toBeNull();
  });
});

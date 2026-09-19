import { describe, expect, it } from "vitest";
import { buildSaleStats, buildTrustFacts, memberSinceLabel, nextRankInfo } from "./sale-profile-view";

const NOW = new Date("2026-09-19T00:00:00Z");

describe("memberSinceLabel", () => {
  it("dưới 1 tháng là Mới gia nhập, sau đó tính tháng/năm", () => {
    expect(memberSinceLabel(new Date("2026-09-10"), NOW)).toBe("Mới gia nhập");
    expect(memberSinceLabel(new Date("2026-05-01"), NOW)).toBe("4 tháng");
    expect(memberSinceLabel(new Date("2025-09-01"), NOW)).toBe("1 năm");
    expect(memberSinceLabel(new Date("2024-06-01"), NOW)).toBe("2 năm 3 tháng");
  });
});

describe("nextRankInfo", () => {
  it("tính điểm còn thiếu và phần trăm tới hạng kế", () => {
    const info = nextRankInfo(30);
    expect(info.current.id).toBe("bronze");
    expect(info.next?.id).toBe("silver");
    expect(info.missing).toBe(30);
    expect(info.percent).toBe(50);
  });
  it("hạng cao nhất không còn hạng kế", () => {
    const info = nextRankInfo(250);
    expect(info.next).toBeNull();
    expect(info.percent).toBe(100);
  });
});

describe("buildSaleStats", () => {
  it("bỏ ô chưa có dữ liệu thay vì hiện dấu gạch", () => {
    const stats = buildSaleStats({ ratingAverage: 0, ratingTotal: 0, clientsServedCount: null, yearsExperience: null, workArea: null, videoCount: 0, createdAt: new Date("2026-09-01"), now: NOW });
    expect(stats.map((s) => s.key)).toEqual(["member", "area"]);
    expect(stats[1].value).toBe("Phan Thiết");
  });
  it("đủ dữ liệu thì hiện đủ ô", () => {
    const stats = buildSaleStats({ ratingAverage: 4.5, ratingTotal: 2, clientsServedCount: 120, yearsExperience: 3, workArea: "Mũi Né", videoCount: 4, createdAt: new Date("2025-01-01"), now: NOW });
    expect(stats.map((s) => s.key)).toEqual(["rating", "clients", "years", "videos", "member", "area"]);
    expect(stats[1].value).toBe("120+");
  });
});

describe("buildTrustFacts", () => {
  it("chỉ nêu điều có thật", () => {
    const facts = buildTrustFacts({ verified: false, ratingAverage: 0, ratingTotal: 0, videoCount: 0, feedbackCount: 0, rankLabel: "Mới gia nhập", points: 0 });
    expect(facts).toHaveLength(1);
    expect(facts[0].text).toContain("Mới gia nhập");
  });
});

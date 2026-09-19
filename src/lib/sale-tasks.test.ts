import { describe, expect, it } from "vitest";
import { canTransition, sumBonus } from "./sale-tasks";
import { computeSalePoints } from "./sale-points";

describe("canTransition", () => {
  it("đi đúng vòng đời", () => {
    expect(canTransition("REQUESTED", "ASSIGNED")).toBe(true);
    expect(canTransition("ASSIGNED", "SUBMITTED")).toBe(true);
    expect(canTransition("SUBMITTED", "DONE")).toBe(true);
    expect(canTransition("SUBMITTED", "ASSIGNED")).toBe(true);
  });
  it("chặn nhảy bước và sửa việc đã xong", () => {
    expect(canTransition("REQUESTED", "DONE")).toBe(false);
    expect(canTransition("ASSIGNED", "DONE")).toBe(false);
    expect(canTransition("DONE", "ASSIGNED")).toBe(false);
    expect(canTransition("REJECTED", "ASSIGNED")).toBe(false);
  });
});

describe("điểm thưởng", () => {
  it("chỉ tính nhiệm vụ DONE và bỏ số âm", () => {
    expect(sumBonus([{ status: "DONE", bonusPoints: 30 }, { status: "SUBMITTED", bonusPoints: 50 }, { status: "DONE", bonusPoints: -5 }])).toBe(30);
  });

  const base = { id: "p", category: "SALE", avatar: null, coverImage: null, roleTitle: null, slogan: null, workArea: null, yearsExperience: null, clientsServedCount: null, videos: [], socialComments: [], reviews: [], standing: null };
  it("cộng điểm thưởng vào tổng, nhưng về 0 nếu đang bị đình chỉ", () => {
    expect(computeSalePoints({ ...base, bonusPoints: 25 }).points).toBe(25);
    expect(computeSalePoints({ ...base, bonusPoints: 25, standing: { action: "SUSPENDED", active: true } }).points).toBe(0);
  });
});

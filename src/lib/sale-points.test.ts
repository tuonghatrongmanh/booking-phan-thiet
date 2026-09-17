import { describe, it, expect } from "vitest";
import { computeSalePoints, getSaleRank, RANK_TIERS } from "./sale-points";

function basePlace(overrides: Partial<Parameters<typeof computeSalePoints>[0]> = {}) {
  return {
    id: "p1",
    category: "SALE",
    avatar: null,
    coverImage: null,
    roleTitle: null,
    slogan: null,
    workArea: null,
    yearsExperience: null,
    clientsServedCount: null,
    videos: [],
    socialComments: [],
    reviews: [],
    standing: null,
    ...overrides,
  };
}

describe("getSaleRank", () => {
  it("returns bronze for 0 points", () => {
    expect(getSaleRank(0).id).toBe("bronze");
  });

  it("returns diamond at the exact threshold", () => {
    expect(getSaleRank(190).id).toBe("diamond");
  });

  it("returns the tier just below a threshold", () => {
    expect(getSaleRank(189).id).toBe("gold");
  });

  it("every points value maps to a defined tier", () => {
    for (const points of [0, 1, 59, 60, 119, 120, 189, 190, 500]) {
      expect(RANK_TIERS.some((t) => t.id === getSaleRank(points).id)).toBe(true);
    }
  });
});

describe("computeSalePoints", () => {
  it("gives 0 points with no missions completed", () => {
    const { points } = computeSalePoints(basePlace());
    expect(points).toBe(0);
  });

  it("awards profile-complete points when all profile fields are set", () => {
    const { points, missions } = computeSalePoints(
      basePlace({ avatar: "a.png", coverImage: "c.png", roleTitle: "Sale", slogan: "hi", workArea: "Phan Thiet" })
    );
    expect(points).toBe(40);
    expect(missions.find((m) => m.mission.id === "profile-complete")?.done).toBe(true);
  });

  it("requires at least 3 reviews before checking the 4.5-star mission", () => {
    const { missions } = computeSalePoints(basePlace({ reviews: [{ rating: 5 }, { rating: 5 }] }));
    expect(missions.find((m) => m.mission.id === "rating-45")?.done).toBe(false);
  });

  it("awards the 4.5-star mission once there are 3+ reviews averaging >= 4.5", () => {
    const { missions } = computeSalePoints(basePlace({ reviews: [{ rating: 5 }, { rating: 5 }, { rating: 4 }] }));
    expect(missions.find((m) => m.mission.id === "rating-45")?.done).toBe(true);
  });

  it("zeroes out all points when the sale agent is under an active suspension/ban", () => {
    const { points } = computeSalePoints(
      basePlace({
        avatar: "a.png",
        coverImage: "c.png",
        roleTitle: "Sale",
        slogan: "hi",
        workArea: "Phan Thiet",
        videos: [{ id: "v1" }, { id: "v2" }, { id: "v3" }],
        standing: { action: "SUSPENDED", active: true },
      })
    );
    expect(points).toBe(0);
  });

  it("does not penalize when standing exists but is not active", () => {
    const { points } = computeSalePoints(
      basePlace({
        avatar: "a.png",
        coverImage: "c.png",
        roleTitle: "Sale",
        slogan: "hi",
        workArea: "Phan Thiet",
        standing: { action: "BANNED", active: false },
      })
    );
    expect(points).toBe(40);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  foodReview: { findFirst: vi.fn(), count: vi.fn() },
  placeReview: { findFirst: vi.fn(), count: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { checkReviewAllowed } from "./review-guard";

let ipCounter = 0;
const nextIp = () => `10.0.0.${++ipCounter}`;

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.foodReview.findFirst.mockResolvedValue(null);
  prismaMock.placeReview.findFirst.mockResolvedValue(null);
  prismaMock.foodReview.count.mockResolvedValue(0);
  prismaMock.placeReview.count.mockResolvedValue(0);
});

describe("checkReviewAllowed", () => {
  it("allows a first review", async () => {
    expect(await checkReviewAllowed({ kind: "food", targetId: "f1", userId: "u1", ip: nextIp() })).toEqual({ ok: true });
  });

  it("rejects a second review of the same target by the same user (409)", async () => {
    prismaMock.placeReview.findFirst.mockResolvedValue({ id: "r1" });
    const res = await checkReviewAllowed({ kind: "place", targetId: "p1", userId: "u1", ip: nextIp() });
    expect(res).toMatchObject({ ok: false, status: 409 });
  });

  it("caps reviews per account per 24h across food and place (429)", async () => {
    prismaMock.foodReview.count.mockResolvedValue(6);
    prismaMock.placeReview.count.mockResolvedValue(4);
    const res = await checkReviewAllowed({ kind: "food", targetId: "f1", userId: "u1", ip: nextIp() });
    expect(res).toMatchObject({ ok: false, status: 429 });
  });

  it("caps reviews per IP per hour even across different accounts (429)", async () => {
    const ip = nextIp();
    let last;
    for (let i = 0; i < 16; i++) {
      last = await checkReviewAllowed({ kind: "food", targetId: "f1", userId: `u${i}`, ip });
    }
    expect(last).toMatchObject({ ok: false, status: 429 });
  });
});

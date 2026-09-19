import { describe, expect, it } from "vitest";
import { matchesTokens, normalizeText, remainingUnits } from "./vehicle-search";

describe("normalizeText", () => {
  it("strips Vietnamese diacritics, đ and case", () => {
    expect(normalizeText("  Xe Số Đẹp - Mũi Né ")).toBe("xe so dep - mui ne");
    expect(normalizeText("Đà Nẵng")).toBe("da nang");
  });
});

describe("matchesTokens", () => {
  const hay = normalizeText("Honda Air Blade 125cc Tự động Mũi Né xe tay ga");
  it("requires every word, in any order, ignoring accents", () => {
    expect(matchesTokens(hay, "tay ga honda")).toBe(true);
    expect(matchesTokens(hay, "MUI NE 125")).toBe(true);
    expect(matchesTokens(hay, "tay ga yamaha")).toBe(false);
  });
  it("matches everything for an empty query", () => {
    expect(matchesTokens(hay, "   ")).toBe(true);
  });
});

describe("remainingUnits", () => {
  const v = { totalRooms: 3, bookedRanges: [{ from: "2026-12-10", to: "2026-12-12", qty: 2 }] };
  it("subtracts overlapping paid bookings (both end days count)", () => {
    expect(remainingUnits(v, "2026-12-11", "2026-12-11")).toBe(1);
    expect(remainingUnits(v, "2026-12-12", "2026-12-14")).toBe(1);
    expect(remainingUnits(v, "2026-12-13", "2026-12-14")).toBe(3);
  });
  it("never goes below zero and treats missing stock as 1 vehicle", () => {
    expect(remainingUnits({ totalRooms: null, bookedRanges: [{ from: "2026-01-01", to: "2026-01-05", qty: 4 }] }, "2026-01-02", "2026-01-03")).toBe(0);
    expect(remainingUnits({ totalRooms: null, bookedRanges: [] }, "2026-01-02", "2026-01-03")).toBe(1);
  });
});
